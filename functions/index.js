const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// --- Analytics ---
const { trackHandler } = require('./analytics/tracker.cjs');
const { dashboardHandler } = require('./analytics/dashboard.cjs');

// --- Research handler (shared with local server.js) ---
const { handleResearchRequest, INTERVIEW_PROMPT } = require('./research-handler');

const analyticsPassword = defineSecret('ANALYTICS_PASSWORD');
const openaiApiKey = defineSecret('OPENAI_API_KEY');
const authorAppPassword = defineSecret('AUTHOR_APP_PASSWORD');
const authorSessionSecret = defineSecret('AUTHOR_SESSION_SECRET');

exports.track = onRequest(trackHandler(db));
exports.analyticsApi = onRequest({ secrets: [analyticsPassword] }, dashboardHandler(db));

// --- identity.txt voice interview tool (password-protected) ---

// Direct Cloud Run URL of the researchStream function below. Firebase Hosting
// cannot stream responses (it buffers + has a 60s timeout), so the browser hits
// this URL directly with a Bearer token, bypassing Hosting entirely.
const RESEARCH_STREAM_URL = 'https://us-central1-identitytxt.cloudfunctions.net/researchStream';

const ALLOWED_RESEARCH_ORIGIN = 'https://identitytxt.org';

// Parse __session cookie (the only cookie Firebase Hosting forwards)
function parseSessionCookie(req) {
  const header = req.headers.cookie || '';
  const match = header.match(/(?:^|;\s*)__session=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

exports.authorApp = onRequest(
  {
    secrets: [openaiApiKey, authorAppPassword, authorSessionSecret],
    // Research calls take 3-4 minutes; default 60s is far too short.
    timeoutSeconds: 600,
    memory: '512MiB',
  },
  async (req, res) => {
    const PASSWORD = authorAppPassword.value();
    const SESSION_SECRET = authorSessionSecret.value();
    const OPENAI_KEY = openaiApiKey.value();

    // Strip the /create/api prefix to get the route
    const route = req.path.replace(/^\/create\/api/, '');

    res.set('X-Content-Type-Options', 'nosniff');

    // POST /create/api/login
    if (route === '/login' && req.method === 'POST') {
      if (req.body?.password === PASSWORD) {
        // Firebase Hosting only forwards the __session cookie
        // 7-day cookie. The browser will sometimes still drop this depending
        // on privacy settings; the client-side 401 handler offers a one-click
        // re-login when it happens.
        res.setHeader('Set-Cookie',
          `__session=${SESSION_SECRET}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`
        );
        // Bootstrap the browser with what it needs to make the streaming
        // research call. researchEndpoint is the direct Cloud Run URL of the
        // researchStream function — we bypass Hosting for streaming because
        // its CDN buffers responses and has a 60s timeout. sessionSecret is
        // the Bearer token for that cross-origin call (same shared secret
        // as the __session cookie, different transport).
        res.json({
          ok: true,
          sessionSecret: SESSION_SECRET,
          researchEndpoint: RESEARCH_STREAM_URL,
        });
      } else {
        res.status(401).json({ error: 'Wrong password' });
      }
      return;
    }

    // All other routes require auth via __session cookie
    {
      const cookieValue = parseSessionCookie(req);
      if (cookieValue !== SESSION_SECRET) {
        // Diagnostic breadcrumb so we can tell missing-cookie from
        // value-mismatch in Cloud Logging next time this happens.
        const len = cookieValue ? cookieValue.length : 0;
        const prefix = cookieValue ? cookieValue.slice(0, 8) : '';
        console.log(
          `auth fail on ${route}: cookie_len=${len} prefix="${prefix}" expected_len=${SESSION_SECRET.length}`
        );
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
    }

    // GET /create/api/session - lets a refreshed page re-bootstrap without
    // having to re-login (cookie still valid).
    if (route === '/session' && req.method === 'GET') {
      res.json({
        sessionSecret: SESSION_SECRET,
        researchEndpoint: RESEARCH_STREAM_URL,
      });
      return;
    }

    // POST /create/api/token
    // Mints an ephemeral client_secret for the GA Realtime API (gpt-realtime-2).
    // Voice, transcription model, and instructions are sent later via session.update
    // over the WebRTC data channel (see public/js/realtime.js).
    if (route === '/token' && req.method === 'POST') {
      try {
        const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session: { type: 'realtime', model: 'gpt-realtime-2' },
          }),
        });
        if (!response.ok) {
          const err = await response.text();
          console.error('OpenAI token error:', err);
          return res.status(response.status).json({ error: err });
        }
        const data = await response.json();
        // GA returns { value: "ek_..." } at the top level; older clients expect
        // client_secret.value. Normalise so the frontend doesn't need to change.
        if (data.value && !data.client_secret) {
          data.client_secret = { value: data.value };
        }
        // Bake the interview prompt into the response so the browser doesn't
        // need a skill-file upload to start the interview.
        data.skill = INTERVIEW_PROMPT;
        res.json(data);
      } catch (e) {
        console.error('Token fetch error:', e);
        res.status(500).json({ error: e.message });
      }
      return;
    }

    // /research used to live here but moved to the researchStream function
    // (below) because Firebase Hosting cannot stream responses through to
    // Cloud Functions. Tell anyone still hitting this route where to go.
    if (route === '/research') {
      res.status(410).json({
        error: 'Moved. Call /api/session to discover the direct streaming URL.',
      });
      return;
    }

    res.status(404).json({ error: 'Not found' });
  }
);

// --- researchStream: direct-to-Cloud-Run streaming function -----------------
//
// This is invoked from the browser directly (cross-origin), bypassing Firebase
// Hosting. Auth via Authorization: Bearer <SESSION_SECRET> instead of cookies
// (HttpOnly cookies don't travel cross-origin).
exports.researchStream = onRequest(
  {
    secrets: [openaiApiKey, authorSessionSecret],
    timeoutSeconds: 600,
    memory: '512MiB',
    cors: false, // we handle CORS manually below — Firebase's CORS wrapper buffers responses
  },
  async (req, res) => {
    // CORS — strictly identitytxt.org. No credentials (we use Bearer auth, not cookies).
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_RESEARCH_ORIGIN);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Max-Age', '3600');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Bearer auth — match the SESSION_SECRET used by the cookie flow.
    const SESSION_SECRET = authorSessionSecret.value();
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token || token !== SESSION_SECRET) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const OPENAI_KEY = openaiApiKey.value();
    try {
      await handleResearchRequest(req, res, OPENAI_KEY);
    } catch (e) {
      console.error('researchStream handler error:', e);
      if (!res.headersSent) {
        res.status(500).json({ error: e.message });
      } else {
        try { res.end(); } catch (_) {}
      }
    }
  }
);

// --- Rate limiting (in-memory) ---

const ipRequestCounts = new Map();   // ip -> { count, resetAt }
const uidRequestCounts = new Map();  // uid -> { count, resetAt }

const IP_RATE_LIMIT = 10;           // requests per minute
const IP_WINDOW_MS = 60 * 1000;
const UID_RATE_LIMIT = 5;           // profile creates per hour
const UID_WINDOW_MS = 60 * 60 * 1000;

// Clean up stale entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of ipRequestCounts) {
    if (now > val.resetAt) ipRequestCounts.delete(key);
  }
  for (const [key, val] of uidRequestCounts) {
    if (now > val.resetAt) uidRequestCounts.delete(key);
  }
}, 60 * 1000);

function checkIpRateLimit(ip) {
  const now = Date.now();
  const entry = ipRequestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= IP_RATE_LIMIT;
}

function checkUidRateLimit(uid) {
  const now = Date.now();
  const entry = uidRequestCounts.get(uid);
  if (!entry || now > entry.resetAt) {
    uidRequestCounts.set(uid, { count: 1, resetAt: now + UID_WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= UID_RATE_LIMIT;
}

// --- Constants ---
const MAX_CONTENT_LENGTH = 15000;
const MAX_HANDLE_LENGTH = 30;
const MIN_HANDLE_LENGTH = 3;
const HANDLE_REGEX = /^[a-z0-9][a-z0-9_-]*[a-z0-9]$/;
const RESERVED_HANDLES = new Set([
  'admin', 'api', 'registry', 'verify', 'login', 'signup',
  'settings', 'help', 'about', 'spec', 'root', 'null',
  'undefined', 'identitytxt', 'identity', 'system', 'mod',
  'moderator', 'support', 'security', 'www', 'mail', 'ftp',
]);

// --- Input sanitisation ---

function sanitiseString(input, maxLength) {
  if (typeof input !== 'string') return null;
  // Remove null bytes and control characters (except newline, tab)
  const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return cleaned.slice(0, maxLength);
}

function sanitiseHandle(input) {
  if (typeof input !== 'string') return null;
  return input.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, MAX_HANDLE_LENGTH);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// --- Auth ---

async function verifyAuth(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ') || auth.length > 2000) {
    console.log('Auth header missing or malformed, length:', auth?.length);
    return null;
  }
  const token = auth.slice(7);
  // Reject obviously malformed tokens
  if (!/^[A-Za-z0-9._-]+$/.test(token)) {
    console.log('Token failed regex check');
    return null;
  }
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (err) {
    console.error('verifyIdToken failed:', err.code, err.message);
    return null;
  }
}

// --- Registry function: serves /@handle and /@handle/identity.txt ---

exports.registry = onRequest(async (req, res) => {
  // Only allow GET
  if (req.method !== 'GET') {
    res.status(405).send('Method not allowed');
    return;
  }

  const path = req.path;

  // Strict path parsing - only allow expected characters
  const match = path.match(/^\/@([a-z0-9_-]{3,30})(\/identity\.txt)?$/);
  if (!match) {
    res.status(404).send(notFoundPage(null));
    return;
  }

  const handle = match[1];
  const wantsRaw = !!match[2];

  // Firestore document ID is the handle - already validated by regex
  const doc = await db.collection('profiles').doc(handle).get();
  if (!doc.exists) {
    res.status(404).send(notFoundPage(handle));
    return;
  }

  const profile = doc.data();

  // Serve raw identity.txt - this is the primary URL people share
  if (wantsRaw) {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=300');
    res.set('X-Content-Type-Options', 'nosniff');
    res.send(profile.content);
    return;
  }

  // Redirect /@handle to the raw file directly (no profile pages for now)
  res.redirect(301, `/@${handle}/identity.txt`);
});

// --- API function: profile creation ---

exports.api = onRequest(async (req, res) => {
  // Security headers
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');

  // CORS - restrict to our own domains
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'https://identitytxt.org',
    'https://identitytxt.web.app',
    'https://identitytxt.firebaseapp.com',
    'http://localhost:5000',
    'http://localhost:8888',
  ];
  if (allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Rate limit by IP
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  if (!checkIpRateLimit(clientIp)) {
    res.status(429).json({ error: 'Too many requests. Try again later.' });
    return;
  }

  const route = req.path.replace(/^\/api/, '');

  // --- GET /api/profile ---
  if (route === '/profile' && req.method === 'GET') {
    const user = await verifyAuth(req);
    if (!user) { res.status(401).json({ error: 'Unauthorised' }); return; }

    const snap = await db.collection('profiles').where('uid', '==', user.uid).limit(1).get();
    if (snap.empty) {
      res.json({ profile: null });
      return;
    }
    const doc = snap.docs[0];
    // Don't leak internal fields
    const data = doc.data();
    res.json({
      profile: {
        handle: doc.id,
        name: data.name,
        provider: data.provider,
        authenticated: data.authenticated || false,
        nameMatch: data.nameMatch ?? null,
        updatedAt: data.updatedAt,
      }
    });
    return;
  }

  // --- POST /api/profile ---
  if (route === '/profile' && req.method === 'POST') {
    const user = await verifyAuth(req);
    if (!user) { res.status(401).json({ error: 'Unauthorised' }); return; }

    // Per-user rate limit (5 profile creates per hour)
    if (!checkUidRateLimit(user.uid)) {
      res.status(429).json({ error: 'Too many requests. Try again later.' });
      return;
    }

    // Reject if body is too large (defence in depth, also set in hosting)
    const rawBody = JSON.stringify(req.body || {});
    if (rawBody.length > MAX_CONTENT_LENGTH + 1000) {
      res.status(413).json({ error: 'Request too large' });
      return;
    }

    // Sanitise inputs
    const handle = sanitiseHandle(req.body?.handle);
    const content = sanitiseString(req.body?.content, MAX_CONTENT_LENGTH);
    // Get email directly from the verified Firebase token
    const email = (user.email || '').toLowerCase();

    // Validate handle
    if (!handle || handle.length < MIN_HANDLE_LENGTH || !HANDLE_REGEX.test(handle)) {
      res.status(400).json({ error: 'Handle must be 3-30 characters: lowercase letters, numbers, hyphens' });
      return;
    }
    if (RESERVED_HANDLES.has(handle)) {
      res.status(400).json({ error: 'This handle is reserved' });
      return;
    }

    // Validate content
    if (!content || content.length < 20) {
      res.status(400).json({ error: 'Content is too short' });
      return;
    }
    if (!content.match(/^# .+/m)) {
      res.status(400).json({ error: 'identity.txt must start with an H1 heading (# Your Name)' });
      return;
    }
    if (!content.match(/^## .+/m)) {
      res.status(400).json({ error: 'identity.txt must have at least one H2 section (## Voice, ## Expertise, etc.)' });
      return;
    }

    // Check for suspicious content (script tags, HTML injection attempts)
    if (/<script|<iframe|<object|<embed|javascript:/i.test(content)) {
      res.status(400).json({ error: 'Content contains disallowed HTML' });
      return;
    }

    // Verify we have an email from the token
    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'No email found on your authenticated account' });
      return;
    }

    // Check if H1 name matches OAuth display name
    const h1Name = extractName(content);
    // Firebase ID token has 'name' field for display name
    const displayName = (user.name || '').trim();
    const nameMatch = h1Name.toLowerCase() === displayName.toLowerCase();

    // Check handle availability (use transaction for atomicity)
    try {
      await db.runTransaction(async (t) => {
        const handleDoc = await t.get(db.collection('handles').doc(handle));

        if (handleDoc.exists && handleDoc.data().uid !== user.uid) {
          throw new Error('Handle already taken');
        }

        // Check user doesn't already have a different handle
        const existingSnap = await db.collection('handles').where('uid', '==', user.uid).limit(1).get();
        if (!existingSnap.empty && existingSnap.docs[0].id !== handle) {
          // Delete old handle claim
          t.delete(db.collection('handles').doc(existingSnap.docs[0].id));
          t.delete(db.collection('profiles').doc(existingSnap.docs[0].id));
        }

        t.set(db.collection('handles').doc(handle), {
          uid: user.uid,
          claimedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        const now = admin.firestore.FieldValue.serverTimestamp();
        t.set(db.collection('profiles').doc(handle), {
          uid: user.uid,
          content: content,
          provider: user.firebase?.sign_in_provider || 'unknown',
          authenticatedEmail: email,
          authenticated: true,
          name: h1Name,
          nameMatch: nameMatch,
          updatedAt: now,
          createdAt: handleDoc.exists ? handleDoc.data().claimedAt || now : now,
        });
      });
    } catch (err) {
      if (err.message === 'Handle already taken') {
        res.status(409).json({ error: 'Handle already taken' });
      } else {
        console.error('Transaction failed:', err);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
      }
      return;
    }

    res.json({
      ok: true,
      url: `https://identitytxt.org/@${handle}/identity.txt`
    });
    return;
  }

  res.status(404).json({ error: 'Not found' });
});

// --- Helpers ---

function extractName(content) {
  const match = content.match(/^# (.+)$/m);
  if (!match) return 'Unknown';
  // Truncate and strip any remaining markup
  return match[1].trim().replace(/[<>"']/g, '').slice(0, 100);
}

function notFoundPage(handle) {
  const handleText = handle ? `@${escapeHtml(handle)}` : 'This page';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Not found - identity.txt</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/style.css">
  <style>
    .not-found { max-width: 480px; margin: 0 auto; padding: 4rem 0; text-align: center; }
    .not-found h1 { font-size: 1.8rem; margin-bottom: 0.75rem; letter-spacing: -0.02em; }
    .not-found p { color: #666; margin-bottom: 1.5rem; line-height: 1.6; }
    .not-found .handle { font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; color: #FF5200; }
    .not-found .actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem; }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <a href="/" class="site-title">identity<span>.txt</span></a>
      <nav>
        <a href="/#spec">Spec</a>
        <a href="/#why">Why</a>
        <a href="/#host">Host</a>
      </nav>
    </div>
  </header>
  <div class="container">
    <div class="not-found">
      <h1>Nothing here yet</h1>
      <p><span class="handle">${handleText}</span> doesn't have an identity.txt file. Maybe they haven't created one yet, or the URL has a typo.</p>
      <div class="actions">
        <a href="/host/" class="btn btn-primary">Create yours</a>
        <a href="/" class="btn btn-outline">What is identity.txt?</a>
      </div>
    </div>
  </div>
  <footer>
    <div class="container">
      <span>A <a href="https://www.fiftyfiveandfive.com" target="_blank" rel="noopener">Fifty Five and Five</a> project</span>
      <span>identity.txt is an open standard</span>
    </div>
  </footer>
</body>
</html>`;
}
