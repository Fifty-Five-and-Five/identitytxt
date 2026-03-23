const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 6767;
const PASSWORD = process.env.APP_PASSWORD || 'Pass@word1!';
const SESSION_SECRET = process.env.SESSION_SECRET || 'author-md-fixed-session-key';

// Read OpenAI key - env var first, then local file
let OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  const keyPath = path.join(process.env.HOME, '.config/openai/key');
  try {
    OPENAI_KEY = fs.readFileSync(keyPath, 'utf8').trim();
  } catch (e) {
    console.error('No OPENAI_API_KEY env var and could not read from', keyPath);
    process.exit(1);
  }
}

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// Auth middleware
function requireAuth(req, res, next) {
  if (req.cookies?.auth === SESSION_SECRET) return next();
  if (req.path.endsWith('.html')) return res.redirect('/');
  res.status(401).json({ error: 'Unauthorized' });
}

// Login
app.post('/api/login', (req, res) => {
  if (req.body.password === PASSWORD) {
    res.cookie('auth', SESSION_SECRET, { httpOnly: true, sameSite: 'lax' });
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'Wrong password' });
  }
});

// Mint ephemeral token for OpenAI Realtime API
app.post('/api/token', requireAuth, async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview',
        voice: 'sage',
        modalities: ['audio', 'text'],
        input_audio_transcription: { model: 'gpt-4o-mini-transcribe', language: 'en' },
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      console.error('Token error:', err);
      return res.status(response.status).json({ error: err });
    }
    const data = await response.json();
    res.json(data);
  } catch (e) {
    console.error('Token fetch error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Static files - login page is public
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Protected app page
app.get('/app.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/app.html'));
});

app.listen(PORT, () => {
  console.log(`author.md demo running at http://localhost:${PORT}`);
});
