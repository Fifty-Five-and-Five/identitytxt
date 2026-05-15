// Shared handler for the /api/research SSE endpoint.
// Used by both server.js (local dev) and functions/index.js (production).

const fs = require('fs');
const path = require('path');

// Load prompts once at module load.
const PROMPTS_DIR = path.join(__dirname, 'prompts');
const RESEARCH_PROMPT = fs.readFileSync(
  path.join(PROMPTS_DIR, 'authorprofilemaker.research.md'),
  'utf8'
);
const INTERVIEW_PROMPT = fs.readFileSync(
  path.join(PROMPTS_DIR, 'authorprofilemaker.interview.md'),
  'utf8'
);

const MODEL = 'gpt-5-mini';

function sanitiseField(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').slice(0, maxLength).trim();
}

function sseWrite(res, eventName, dataObj) {
  res.write(`event: ${eventName}\n`);
  res.write(`data: ${JSON.stringify(dataObj)}\n\n`);
}

// Parse OpenAI's SSE stream of "data: {...}" chunks.
// Each event from OpenAI has the form: data: <json>\n\n where <json> includes a `type` field.
async function streamFromOpenAI(openaiResponse, onEvent) {
  const reader = openaiResponse.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by double-newlines.
    let idx;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);

      // Each event may have multiple "data:" lines. Concatenate them.
      const dataLines = rawEvent
        .split('\n')
        .filter(line => line.startsWith('data:'))
        .map(line => line.slice(5).trimStart());
      if (dataLines.length === 0) continue;
      const dataStr = dataLines.join('\n');
      if (dataStr === '[DONE]') {
        onEvent({ type: 'done' });
        continue;
      }
      try {
        const parsed = JSON.parse(dataStr);
        onEvent(parsed);
      } catch (e) {
        // Ignore malformed chunks (keepalives etc.)
      }
    }
  }
}

async function handleResearchRequest(req, res, openaiKey) {
  const name = sanitiseField(req.body?.name, 200);
  const title = sanitiseField(req.body?.title, 200);
  const company = sanitiseField(req.body?.company, 200);
  const companyUrl = sanitiseField(req.body?.companyUrl, 500);
  const linkedinUrl = sanitiseField(req.body?.linkedinUrl, 500);

  if (!name || !company || !linkedinUrl) {
    res.status(400).json({ error: 'name, company, and linkedinUrl are required' });
    return;
  }

  // SSE headers. Combination below disables Hosting CDN caching.
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-cache, no-store, no-transform, must-revalidate, max-age=0');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();
  // Cloud Run buffers small responses (~1 KB) before flushing. Send a 4 KB
  // padded comment immediately so the buffer flushes and the client sees the
  // stream is open within milliseconds.
  res.write(': ' + ' '.repeat(4096) + '\n\n');

  // Keepalive ticks - prevents 60s idle timeouts on the Hosting proxy and
  // keeps the Cloud Run output pipe flowing during long reasoning phases.
  const keepalive = setInterval(() => {
    try { res.write(': ka\n\n'); } catch (_) {}
  }, 5000);
  res.on('close', () => clearInterval(keepalive));

  const userMessage = `Research this person and produce the research markdown in the exact schema specified in the instructions.

Name: ${name}
Title: ${title}
Company: ${company}
Company website: ${companyUrl}
LinkedIn: ${linkedinUrl}

Follow every step in the instructions including the deep content analysis. Fetch 3-5 published articles, extract exact phrases, exact metaphors, tool opinions, voice mode differences. Use the LinkedIn-blocked fallback (quote search on external sites) if LinkedIn returns 999/403. Aim for 3-4 minutes of work.`;

  let openaiResponse;
  try {
    openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        reasoning: { effort: 'high' },
        tools: [{
          type: 'web_search',
          search_context_size: 'high',
          external_web_access: true,
          return_token_budget: 'unlimited',
        }],
        stream: true,
        instructions: RESEARCH_PROMPT,
        input: userMessage,
      }),
    });
  } catch (e) {
    sseWrite(res, 'error', { message: `Network error: ${e.message}` });
    res.end();
    return;
  }

  if (!openaiResponse.ok) {
    const errText = await openaiResponse.text();
    console.error('OpenAI Responses API error:', openaiResponse.status, errText);
    sseWrite(res, 'error', {
      message: `OpenAI returned ${openaiResponse.status}`,
      detail: errText.slice(0, 500),
    });
    res.end();
    return;
  }

  let endedNormally = false;

  try {
    await streamFromOpenAI(openaiResponse, (event) => {
      const type = event.type;
      if (process.env.IDENTITYTXT_DEBUG === '1' && type) {
        console.log('[research raw]', type, JSON.stringify(event).slice(0, 600));
      }

      // A new item is starting. For web_search_call items, the query isn't
      // populated yet (status is "in_progress") — emit a generic "search"
      // event so the UI can flip its "now doing" line.
      if (type === 'response.output_item.added') {
        if (event.item?.type === 'web_search_call') {
          sseWrite(res, 'search', { query: '' });
        }
        return;
      }

      // The item is complete — for web_search_call this is where the action
      // (with query/url) finally appears.
      if (type === 'response.output_item.done') {
        if (event.item?.type === 'web_search_call') {
          const action = event.item.action || {};
          let label = '';
          if (action.type === 'search') {
            label = action.query
              || (Array.isArray(action.queries) ? action.queries[0] : '')
              || '';
          } else if (action.type === 'open_page') {
            label = action.url ? `Reading ${action.url}` : '';
          } else {
            label = action.query || action.url || '';
          }
          sseWrite(res, 'search_done', { query: label });
        }
        return;
      }

      // Streamed text deltas (the markdown the user wants).
      if (type === 'response.output_text.delta') {
        const delta = event.delta ?? '';
        if (delta) sseWrite(res, 'delta', { text: delta });
        return;
      }

      // End of stream.
      if (type === 'response.completed' || type === 'done') {
        endedNormally = true;
        sseWrite(res, 'done', {});
        return;
      }

      // Surface API-level errors.
      if (type === 'response.failed' || type === 'error') {
        const msg = event.error?.message || event.message || 'OpenAI reported an error';
        sseWrite(res, 'error', { message: msg });
        return;
      }
    });
  } catch (e) {
    console.error('Stream read error:', e);
    sseWrite(res, 'error', { message: `Stream read error: ${e.message}` });
  }

  if (!endedNormally) {
    sseWrite(res, 'done', {});
  }
  clearInterval(keepalive);
  res.end();
}

module.exports = {
  handleResearchRequest,
  INTERVIEW_PROMPT,
};
