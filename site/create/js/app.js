const orb = new Orb(document.getElementById('orb'));

// DOM refs
const btnStart = document.getElementById('btn-start');
const btnEnd = document.getElementById('btn-end');
const statusEl = document.getElementById('status');
const transcriptEl = document.getElementById('transcript');
const skillFileInput = document.getElementById('skill-file');
const skillUploadEl = document.getElementById('skill-upload');
const researchFileInput = document.getElementById('research-file');
const researchUploadEl = document.getElementById('research-upload');
const resultOverlay = document.getElementById('result-overlay');
const resultContent = document.getElementById('result-content');
const btnDownload = document.getElementById('btn-download');
const btnCloseResult = document.getElementById('btn-close-result');

const progressSection = document.getElementById('progress-section');
const progressSteps = document.querySelectorAll('.progress-step');

let session = null;
let skillFileContent = '';
let researchFileContent = '';
let transcript = [];
let transcriptText = '';
let aiTurnCount = 0;

// Map AI turn ranges to interview sections (0-indexed step)
// Approximate: intro, personal details, what you do, core traits, career, stories, topics, voice
const sectionThresholds = [1, 3, 7, 10, 15, 19, 25, 28];

// Skill file upload
skillFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  skillFileContent = await file.text();
  skillUploadEl.classList.add('has-file');
  skillUploadEl.querySelector('.label').innerHTML = `<strong>${file.name}</strong> loaded`;
  checkReady();
});

// Research file upload (required)
researchFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  researchFileContent = await file.text();
  researchUploadEl.classList.add('has-file');
  researchUploadEl.querySelector('.label').innerHTML = `<strong>${file.name}</strong> loaded`;
  checkReady();
});

function checkReady() {
  const ready = skillFileContent && researchFileContent;
  btnStart.disabled = !ready;
  if (ready) {
    statusEl.textContent = 'Ready — skill and research loaded';
  } else if (skillFileContent) {
    statusEl.textContent = 'Now upload the research file';
  } else if (researchFileContent) {
    statusEl.textContent = 'Now upload the skill file';
  }
}

// Build system prompt
function buildSystemPrompt() {
  return `You are a voice interviewer conducting a real-time audio conversation. Your job is to follow the skill file below to interview someone and gather material for their author profile.

LANGUAGE:
- Always conduct the interview in English. All your questions and responses must be in English.
- If the interviewee responds in another language, politely continue in English.

VOICE ADAPTATION:
- This is a spoken conversation, not text. Keep questions natural and conversational.
- Ask one question at a time. Wait for the answer before moving on.
- Never read out template structures, markdown formatting, section headers, or checklists.
- Never dictate what the profile will say. Just interview.
- React naturally to answers. Follow interesting threads.
- When you've covered enough ground per the skill file's guidance, wrap up warmly.

WHAT TO FOCUS ON IN THE SKILL FILE:
- Your job is the INTERVIEW only — the sections labelled "Section 1" through "Section 7" and their questions (Q1-Q18).
- IGNORE everything about profile generation, templates, mapping tables, quality checklists, and the "generate" sub-command. That work happens later in a separate tool. You do not need to think about how answers map to profile sections.
- Follow the Design Principles and question flow. Use the follow-up prompts when answers are thin.

INTERVIEW FLOW:
- Work through the sections in order. After each section, briefly summarise what you heard back to the interviewee to confirm it before moving on. Keep summaries conversational and short — two or three sentences.
- If the interviewee naturally brings up something relevant to a section you've already covered, acknowledge it and capture the new detail. But only revisit a previous topic once — after that, note it and move forward.
- Do not loop back to fill gaps. Trust that the material you've gathered is enough. A separate tool will handle any gaps later.

SKILL FILE:

${skillFileContent}

RESEARCH FILE (pre-gathered background on this person):

${researchFileContent}

HOW TO USE THE RESEARCH:
- The research gives you context — use it to greet the person by name, reference their role and company, and skip the basics.
- Do NOT treat the research as a checklist of gaps to fill. The interview is the primary source of material, not a supplement to the research.
- The research and interview combine to build a complete picture. The interview captures what research never can: stories, opinions, personality, how they think and speak.

HOW TO BEGIN:
- Greet the person by name.
- Give a brief, friendly summary of what you already know about them from the research — their role, company, and one or two highlights. Keep it to 2-3 sentences.
- Then ask: are they ready to get started?
- Once they confirm, begin the interview as the skill file directs.`;
}

// Start interview
btnStart.addEventListener('click', async () => {
  btnStart.disabled = true;
  statusEl.textContent = 'Connecting...';

  try {
    const tokenRes = await fetch('/create/api/token', { method: 'POST' });
    if (!tokenRes.ok) throw new Error('Failed to get token');
    const tokenData = await tokenRes.json();

    transcript = [];
    aiTurnCount = 0;
    transcriptEl.innerHTML = '<div class="empty">Listening...</div>';
    progressSection.style.display = '';
    resetProgress();

    session = new RealtimeSession({
      onTranscript: (speaker, text) => {
        transcript.push({ speaker, text });
        addTranscriptEntry(speaker, text);
        if (speaker === 'ai') {
          aiTurnCount++;
          updateProgress();
        }
      },
      onStateChange: (state) => {
        orb.setState(state);
        if (state === 'listening') {
          statusEl.textContent = 'Listening...';
        } else if (state === 'speaking') {
          statusEl.textContent = 'Speaking...';
        }
      },
      onAudioLevel: (level) => {
        orb.setAudioLevel(level);
      },
      onError: (err) => {
        console.error('Session error:', err);
        statusEl.textContent = `Error: ${err.message}`;
        orb.setState('idle');
      },
    });

    await session.connect(tokenData.client_secret.value, buildSystemPrompt());

    btnStart.style.display = 'none';
    btnEnd.style.display = 'inline-flex';
    statusEl.textContent = 'Connecting to interviewer...';

  } catch (err) {
    console.error(err);
    statusEl.textContent = `Error: ${err.message}`;
    btnStart.disabled = false;
  }
});

// End interview and show transcript
btnEnd.addEventListener('click', () => {
  if (!session) return;

  session.disconnect();
  session = null;
  orb.setState('idle');
  orb.setAudioLevel(0);

  transcriptText = transcript
    .map(e => `${e.speaker === 'ai' ? 'Interviewer' : 'Interviewee'}: ${e.text}`)
    .join('\n\n');

  resultContent.textContent = transcriptText;
  resultOverlay.classList.add('visible');
  statusEl.textContent = 'Interview complete — download your transcript';

  btnEnd.style.display = 'none';
  btnStart.style.display = 'inline-flex';
  btnStart.disabled = false;
});

// Download transcript
btnDownload.addEventListener('click', () => {
  const blob = new Blob([transcriptText], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'interview-transcript.md';
  a.click();
  URL.revokeObjectURL(url);
});

// Close result
btnCloseResult.addEventListener('click', () => {
  resultOverlay.classList.remove('visible');
});

// Progress tracking
function updateProgress() {
  let currentStep = 0;
  for (let i = sectionThresholds.length - 1; i >= 0; i--) {
    if (aiTurnCount >= sectionThresholds[i]) {
      currentStep = i;
      break;
    }
  }
  progressSteps.forEach((el, i) => {
    el.classList.remove('active', 'done');
    if (i < currentStep) el.classList.add('done');
    else if (i === currentStep) el.classList.add('active');
  });
}

function resetProgress() {
  progressSteps.forEach(el => el.classList.remove('active', 'done'));
}

// Add transcript entry
function addTranscriptEntry(speaker, text) {
  const empty = transcriptEl.querySelector('.empty');
  if (empty) empty.remove();

  const entry = document.createElement('div');
  entry.className = 'entry';
  entry.innerHTML = `
    <div class="speaker ${speaker}">${speaker === 'ai' ? 'Interviewer' : 'You'}</div>
    <div>${text}</div>
  `;
  transcriptEl.appendChild(entry);
  transcriptEl.scrollTop = transcriptEl.scrollHeight;
}
