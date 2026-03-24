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

const infoBox = document.getElementById('info-box');
const progressSection = document.getElementById('progress-section');
const progressSteps = document.querySelectorAll('.progress-step');
const timerDisplay = document.getElementById('timer-display');
const timerText = document.getElementById('timer-text');

let session = null;
let skillFileContent = '';
let researchFileContent = '';
let transcript = [];
let transcriptText = '';
let aiTurnCount = 0;

// Timer state
const SESSION_LIMIT_MS = 60 * 60 * 1000; // 60 minutes
const WARN_AT_MS = 45 * 60 * 1000;       // warning at 45 min
const WRAPUP_AT_MS = 50 * 60 * 1000;     // tell AI to wrap up at 50 min
const URGENT_AT_MS = 55 * 60 * 1000;     // urgent at 55 min
const AUTO_END_MS = 57 * 60 * 1000;      // auto-end at 57 min (3 min buffer)
let interviewStartTime = null;
let timerInterval = null;
let wrapUpSent = false;
let finalWrapUpSent = false;

// Section tracking for anti-loop
const sectionNames = ['Intro', 'Personal Details', 'What You Do', 'Core Traits', 'Career Arc', 'Key Stories', 'Topics', 'Voice & Tone'];
const sectionThresholds = [1, 3, 7, 10, 15, 19, 25, 28];
let lastReminderAtTurn = 0;
const REMINDER_INTERVAL = 6; // send progress reminder every 6 AI turns

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

LANGUAGE (MANDATORY):
- You MUST speak English at all times. Every word you say must be in English. No exceptions.
- Even if the interviewee speaks in another language, you must always reply in English.
- Never switch languages, never translate, never repeat what was said in another language. English only.

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
- Work through the sections in strict order: Section 1, then 2, then 3, then 4, then 5, then 6, then 7. Never skip ahead or go back.
- After each section, briefly summarise what you heard back to the interviewee to confirm it before moving on. Keep summaries conversational and short — two or three sentences.
- If the interviewee naturally brings up something relevant to a section you've already covered, acknowledge it and capture the new detail. But only revisit a previous topic once — after that, note it and move forward.
- Do not loop back to fill gaps. Trust that the material you've gathered is enough. A separate tool will handle any gaps later.

CRITICAL RULES — NEVER BREAK THESE:
- NEVER re-greet the interviewee or re-introduce yourself after the interview has started. You greet them exactly once at the beginning.
- NEVER repeat a question you have already asked. If you have already covered a topic, move forward.
- NEVER ask the interviewee if they are ready to start after the interview is already underway.
- Keep track of which sections and questions you have completed. If you receive a system note about progress, follow it.
- If you feel uncertain about where you are in the interview, move FORWARD to the next uncovered section rather than going back.

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

// Timer functions
function startTimer() {
  interviewStartTime = Date.now();
  wrapUpSent = false;
  finalWrapUpSent = false;
  timerDisplay.className = 'timer-display';
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimer() {
  if (!interviewStartTime) return;

  const elapsed = Date.now() - interviewStartTime;
  const remaining = Math.max(0, SESSION_LIMIT_MS - elapsed);
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  timerText.textContent = `${mins}:${secs.toString().padStart(2, '0')} remaining`;

  // Visual warnings
  if (elapsed >= URGENT_AT_MS) {
    timerDisplay.className = 'timer-display urgent';
  } else if (elapsed >= WARN_AT_MS) {
    timerDisplay.className = 'timer-display warning';
  }

  // Tell AI to wrap up at 50 min
  if (elapsed >= WRAPUP_AT_MS && !wrapUpSent && session) {
    wrapUpSent = true;
    session.injectGuidance(
      'TIME CHECK: You have about 10 minutes left in this session. Start wrapping up the interview. ' +
      'If you are mid-section, finish it briefly. If you have sections remaining, skip to a brief closing. ' +
      'Summarise what you have captured overall and thank the interviewee warmly. Do NOT start any new major sections.'
    );
  }

  // Tell AI to end now at 55 min
  if (elapsed >= URGENT_AT_MS && !finalWrapUpSent && session) {
    finalWrapUpSent = true;
    session.injectGuidance(
      'TIME CHECK: The session is ending in about 2 minutes. You must wrap up NOW. ' +
      'Give a brief final summary of what was covered, thank the interviewee, and say goodbye. ' +
      'Do not ask any more questions.'
    );
    // Trigger AI to respond to the wrap-up instruction
    session.send({ type: 'response.create' });
  }

  // Auto-end at 57 min
  if (elapsed >= AUTO_END_MS) {
    endInterview();
  }
}

// Get current section index from turn count
function getCurrentSection() {
  let currentStep = 0;
  for (let i = sectionThresholds.length - 1; i >= 0; i--) {
    if (aiTurnCount >= sectionThresholds[i]) {
      currentStep = i;
      break;
    }
  }
  return currentStep;
}

// Send progress reminder to prevent looping
function sendProgressReminder() {
  if (!session) return;

  const currentSection = getCurrentSection();
  const completedSections = sectionNames.slice(0, currentSection).join(', ');
  const currentSectionName = sectionNames[currentSection];
  const remainingSections = sectionNames.slice(currentSection + 1).join(', ');

  let message = `PROGRESS REMINDER: You are currently on "${currentSectionName}" (Section ${currentSection + 1} of ${sectionNames.length}).`;
  if (completedSections) {
    message += ` Sections already completed: ${completedSections}. Do NOT revisit these or re-ask questions from them.`;
  }
  if (remainingSections) {
    message += ` Sections still to cover: ${remainingSections}.`;
  }
  message += ' Continue moving forward through the interview in order.';

  session.injectGuidance(message);
}

// Start interview
btnStart.addEventListener('click', async () => {
  btnStart.disabled = true;
  statusEl.textContent = 'Connecting...';

  try {
    const tokenRes = await fetch('/api/token', { method: 'POST' });
    if (!tokenRes.ok) throw new Error('Failed to get token');
    const tokenData = await tokenRes.json();

    transcript = [];
    aiTurnCount = 0;
    lastReminderAtTurn = 0;
    transcriptEl.innerHTML = '<div class="empty">Listening...</div>';
    infoBox.style.display = 'none';
    progressSection.style.display = '';
    resetProgress();
    startTimer();

    session = new RealtimeSession({
      onTranscript: (speaker, text) => {
        transcript.push({ speaker, text });
        addTranscriptEntry(speaker, text);
        if (speaker === 'ai') {
          aiTurnCount++;
          updateProgress();

          // Send progress reminder every N AI turns to prevent looping
          if (aiTurnCount - lastReminderAtTurn >= REMINDER_INTERVAL) {
            lastReminderAtTurn = aiTurnCount;
            sendProgressReminder();
          }
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
    stopTimer();
  }
});

// End interview (used by button and auto-end)
function endInterview() {
  if (!session) return;

  session.disconnect();
  session = null;
  orb.setState('idle');
  orb.setAudioLevel(0);
  stopTimer();

  transcriptText = transcript
    .map(e => `${e.speaker === 'ai' ? 'Interviewer' : 'Interviewee'}: ${e.text}`)
    .join('\n\n');

  resultContent.textContent = transcriptText;
  resultOverlay.classList.add('visible');
  statusEl.textContent = 'Interview complete — download your transcript';

  btnEnd.style.display = 'none';
  btnStart.style.display = 'inline-flex';
  btnStart.disabled = false;
}

// End interview button
btnEnd.addEventListener('click', endInterview);

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
  const currentStep = getCurrentSection();
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
