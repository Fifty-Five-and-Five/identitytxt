// Analytics tracking endpoint
// Receives pageview beacons, filters bots, writes to Firestore
'use strict';

const crypto = require('crypto');
const { isBot } = require('./botFilter.cjs');
const { parseUA } = require('./uaParser.cjs');

// Rate limiting: in-memory map of IP -> { count, resetAt }
const rateLimits = new Map();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60000; // 1 minute

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimits) {
    if (now > val.resetAt) rateLimits.delete(key);
  }
}, 300000);

function getIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.ip || '0.0.0.0';
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

function hashIP(ip, ua) {
  const salt = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return crypto.createHash('sha256').update(ip + ua + salt).digest('hex').slice(0, 16);
}

function extractReferrerDomain(referrer) {
  if (!referrer) return '';
  try {
    const hostname = new URL(referrer).hostname;
    // Filter internal referrers
    if (hostname === 'identitytxt.org' || hostname.endsWith('.identitytxt.org')) return '';
    if (hostname === 'identitytxt.web.app' || hostname === 'identitytxt.firebaseapp.com') return '';
    if (hostname === 'localhost') return '';
    return hostname;
  } catch (e) {
    return '';
  }
}

// Track which sessions we have seen today (for entry hit detection)
const sessionsToday = new Map(); // sessionId -> true
let sessionDate = new Date().toISOString().slice(0, 10);

function trackHandler(db) {
  return async (req, res) => {
    // Always return 204, no information leakage
    res.status(204);

    if (req.method !== 'POST') { res.end(); return; }

    const ua = req.headers['user-agent'] || '';
    const acceptLang = req.headers['accept-language'] || '';

    // Bot filter
    if (isBot(ua, acceptLang)) { res.end(); return; }

    // Rate limit
    const ip = getIP(req);
    if (!checkRateLimit(ip)) { res.end(); return; }

    // Parse body
    const body = req.body;
    if (!body || body.type !== 'pageview') { res.end(); return; }

    // Validate path
    const path = typeof body.u === 'string' ? body.u.slice(0, 500) : '/';
    const title = typeof body.t === 'string' ? body.t.slice(0, 200) : '';
    const referrer = typeof body.r === 'string' ? body.r.slice(0, 1000) : '';

    const sessionId = hashIP(ip, ua);
    const parsed = parseUA(ua);
    const referrerDomain = extractReferrerDomain(referrer);
    const today = new Date().toISOString().slice(0, 10);

    // Reset session tracking on new day
    if (today !== sessionDate) {
      sessionsToday.clear();
      sessionDate = today;
    }

    const isEntry = !sessionsToday.has(sessionId);
    sessionsToday.set(sessionId, true);

    const timestamp = new Date();

    try {
      const batch = db.batch();

      // Write individual hit
      const hitRef = db.collection('hits').doc();
      batch.set(hitRef, {
        path: path,
        title: title,
        referrer: referrer,
        referrerDomain: referrerDomain,
        screen: typeof body.s === 'string' ? body.s.slice(0, 20) : '',
        language: typeof body.l === 'string' ? body.l.slice(0, 10) : '',
        timezone: typeof body.tz === 'string' ? body.tz.slice(0, 50) : '',
        utmSource: typeof body.us === 'string' ? body.us.slice(0, 100) : '',
        utmMedium: typeof body.um === 'string' ? body.um.slice(0, 100) : '',
        utmCampaign: typeof body.uc === 'string' ? body.uc.slice(0, 100) : '',
        sessionId: sessionId,
        ip: crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16),
        browser: parsed.browser,
        browserVersion: parsed.browserVersion,
        os: parsed.os,
        device: parsed.device,
        isEntry: isEntry,
        timestamp: timestamp,
      });

      // Update daily stats
      const admin = require('firebase-admin');
      const statsRef = db.collection('stats').doc(today);
      const statsUpdate = {
        views: admin.firestore.FieldValue.increment(1),
      };
      if (isEntry) {
        statsUpdate.visits = admin.firestore.FieldValue.increment(1);
      }
      batch.set(statsRef, statsUpdate, { merge: true });

      await batch.commit();
    } catch (err) {
      console.error('Analytics write failed:', err.message);
    }

    res.end();
  };
}

module.exports = { trackHandler };
