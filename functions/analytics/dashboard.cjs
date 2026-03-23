// Analytics dashboard API
// Password-protected endpoints for viewing site analytics
'use strict';

// In-memory cache: key -> { data, expires }
const cache = new Map();
const CACHE_TTL = 60000; // 60 seconds
const CACHE_MAX = 50;

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) { cache.delete(key); return null; }
  return entry.data;
}

function setCache(key, data) {
  if (cache.size >= CACHE_MAX) {
    // Evict oldest entry
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { data: data, expires: Date.now() + CACHE_TTL });
}

// Timezone to region mapping
const TZ_REGIONS = {
  'Europe/London': 'UK',
  'Europe/Dublin': 'Ireland',
  'Europe/Paris': 'France',
  'Europe/Berlin': 'Germany',
  'Europe/Madrid': 'Spain',
  'Europe/Rome': 'Italy',
  'Europe/Amsterdam': 'Netherlands',
  'Europe/Brussels': 'Belgium',
  'Europe/Zurich': 'Switzerland',
  'Europe/Vienna': 'Austria',
  'Europe/Stockholm': 'Sweden',
  'Europe/Oslo': 'Norway',
  'Europe/Copenhagen': 'Denmark',
  'Europe/Helsinki': 'Finland',
  'Europe/Warsaw': 'Poland',
  'Europe/Prague': 'Czech Republic',
  'Europe/Lisbon': 'Portugal',
  'Europe/Bucharest': 'Romania',
  'Europe/Athens': 'Greece',
  'Europe/Istanbul': 'Turkey',
  'Europe/Moscow': 'Russia',
  'America/New_York': 'US East',
  'America/Chicago': 'US Central',
  'America/Denver': 'US Mountain',
  'America/Los_Angeles': 'US West',
  'America/Toronto': 'Canada East',
  'America/Vancouver': 'Canada West',
  'America/Sao_Paulo': 'Brazil',
  'America/Mexico_City': 'Mexico',
  'America/Argentina/Buenos_Aires': 'Argentina',
  'Asia/Tokyo': 'Japan',
  'Asia/Shanghai': 'China',
  'Asia/Kolkata': 'India',
  'Asia/Seoul': 'South Korea',
  'Asia/Singapore': 'Singapore',
  'Asia/Dubai': 'UAE',
  'Asia/Hong_Kong': 'Hong Kong',
  'Asia/Bangkok': 'Thailand',
  'Asia/Jakarta': 'Indonesia',
  'Australia/Sydney': 'Australia East',
  'Australia/Perth': 'Australia West',
  'Pacific/Auckland': 'New Zealand',
  'Africa/Johannesburg': 'South Africa',
  'Africa/Lagos': 'Nigeria',
  'Africa/Cairo': 'Egypt',
};

function getRegion(tz) {
  if (!tz) return 'Unknown';
  if (TZ_REGIONS[tz]) return TZ_REGIONS[tz];
  // Fallback: extract continent
  var parts = tz.split('/');
  if (parts.length >= 2) return parts[0];
  return 'Unknown';
}

function parseDateRange(query) {
  var now = new Date();
  var end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  var start;

  if (query.start) {
    start = new Date(query.start + 'T00:00:00.000Z');
  } else {
    start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  }

  if (query.end) {
    end = new Date(query.end + 'T23:59:59.999Z');
  }

  return { start: start, end: end };
}

async function fetchHits(db, start, end) {
  var cacheKey = 'hits:' + start.toISOString() + ':' + end.toISOString();
  var cached = getCached(cacheKey);
  if (cached) return cached;

  var snapshot = await db.collection('hits')
    .where('timestamp', '>=', start)
    .where('timestamp', '<=', end)
    .get();

  var hits = [];
  snapshot.forEach(function (doc) {
    hits.push(doc.data());
  });

  setCache(cacheKey, hits);
  return hits;
}

// Endpoint handlers
function summaryEndpoint(hits, profileCount) {
  var sessions = new Set();
  var sessionHitCounts = {};

  hits.forEach(function (h) {
    sessions.add(h.sessionId);
    sessionHitCounts[h.sessionId] = (sessionHitCounts[h.sessionId] || 0) + 1;
  });

  var totalSessions = sessions.size;
  var bounceSessions = 0;
  Object.keys(sessionHitCounts).forEach(function (sid) {
    if (sessionHitCounts[sid] === 1) bounceSessions++;
  });

  return {
    views: hits.length,
    visitors: totalSessions,
    bounceRate: totalSessions > 0 ? Math.round((bounceSessions / totalSessions) * 100) : 0,
    profilesCreated: profileCount,
  };
}

function timeseriesEndpoint(db, start, end) {
  return async function () {
    var cacheKey = 'ts:' + start.toISOString() + ':' + end.toISOString();
    var cached = getCached(cacheKey);
    if (cached) return cached;

    // Generate all dates in range
    var dates = [];
    var d = new Date(start);
    while (d <= end) {
      dates.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }

    var snapshot = await db.collection('stats')
      .where('__name__', '>=', dates[0])
      .where('__name__', '<=', dates[dates.length - 1])
      .get();

    var statsMap = {};
    snapshot.forEach(function (doc) {
      statsMap[doc.id] = doc.data();
    });

    var result = dates.map(function (date) {
      var s = statsMap[date] || {};
      return { date: date, views: s.views || 0, visits: s.visits || 0 };
    });

    setCache(cacheKey, result);
    return result;
  };
}

function groupAndSort(hits, field, limit) {
  var counts = {};
  hits.forEach(function (h) {
    var val = h[field] || '';
    if (!val) return;
    counts[val] = (counts[val] || 0) + 1;
  });

  var sorted = Object.keys(counts).map(function (key) {
    return { name: key, count: counts[key] };
  }).sort(function (a, b) { return b.count - a.count; });

  if (limit) sorted = sorted.slice(0, limit);
  return sorted;
}

function pagesEndpoint(hits) {
  return groupAndSort(hits, 'path', 20);
}

function referrersEndpoint(hits) {
  return groupAndSort(hits, 'referrerDomain', 20);
}

function profilesEndpoint(hits) {
  var profileHits = hits.filter(function (h) {
    return h.path && h.path.startsWith('/@');
  });
  return groupAndSort(profileHits, 'path', 20);
}

function browsersEndpoint(hits) {
  return groupAndSort(hits, 'browser', 0);
}

function osEndpoint(hits) {
  return groupAndSort(hits, 'os', 0);
}

function devicesEndpoint(hits) {
  return groupAndSort(hits, 'device', 0);
}

function regionsEndpoint(hits) {
  // Map timezones to regions first, then group
  var counts = {};
  hits.forEach(function (h) {
    var region = getRegion(h.timezone);
    if (region === 'Unknown') return;
    counts[region] = (counts[region] || 0) + 1;
  });

  return Object.keys(counts).map(function (key) {
    return { name: key, count: counts[key] };
  }).sort(function (a, b) { return b.count - a.count; });
}

async function countProfiles(db, start, end) {
  var cacheKey = 'profiles:' + start.toISOString() + ':' + end.toISOString();
  var cached = getCached(cacheKey);
  if (cached !== null) return cached;

  try {
    var snapshot = await db.collection('profiles')
      .where('createdAt', '>=', start)
      .where('createdAt', '<=', end)
      .get();
    var count = snapshot.size;
    setCache(cacheKey, count);
    return count;
  } catch (e) {
    return 0;
  }
}

function dashboardHandler(db) {
  return async function (req, res) {
    // CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type, x-analytics-password');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    // Auth check
    var password = process.env.ANALYTICS_PASSWORD;
    if (!password) {
      res.status(500).json({ error: 'Analytics password not configured' });
      return;
    }

    var provided = req.headers['x-analytics-password'] || '';
    if (provided !== password) {
      res.status(401).json({ error: 'Unauthorised' });
      return;
    }

    // Parse route
    var route = req.path.replace(/^\/api\/a\/?/, '').replace(/\/$/, '') || 'summary';
    var range = parseDateRange(req.query || {});

    try {
      if (route === 'batch' && req.method === 'POST') {
        var body = req.body || {};
        var endpoints = body.endpoints || ['summary', 'timeseries'];
        var batchStart = body.start ? new Date(body.start + 'T00:00:00.000Z') : range.start;
        var batchEnd = body.end ? new Date(body.end + 'T23:59:59.999Z') : range.end;
        var batchRange = { start: batchStart, end: batchEnd };

        var hits = await fetchHits(db, batchRange.start, batchRange.end);
        var result = {};

        for (var i = 0; i < endpoints.length; i++) {
          var ep = endpoints[i];
          switch (ep) {
            case 'summary':
              var profileCount = await countProfiles(db, batchRange.start, batchRange.end);
              result.summary = summaryEndpoint(hits, profileCount);
              break;
            case 'timeseries':
              result.timeseries = await timeseriesEndpoint(db, batchRange.start, batchRange.end)();
              break;
            case 'pages':
              result.pages = pagesEndpoint(hits);
              break;
            case 'referrers':
              result.referrers = referrersEndpoint(hits);
              break;
            case 'profiles':
              result.profiles = profilesEndpoint(hits);
              break;
            case 'browsers':
              result.browsers = browsersEndpoint(hits);
              break;
            case 'os':
              result.os = osEndpoint(hits);
              break;
            case 'devices':
              result.devices = devicesEndpoint(hits);
              break;
            case 'regions':
              result.regions = regionsEndpoint(hits);
              break;
          }
        }

        res.json(result);
        return;
      }

      // Single endpoint requests
      var hits = await fetchHits(db, range.start, range.end);

      switch (route) {
        case 'summary':
          var profileCount = await countProfiles(db, range.start, range.end);
          res.json(summaryEndpoint(hits, profileCount));
          break;
        case 'timeseries':
          res.json(await timeseriesEndpoint(db, range.start, range.end)());
          break;
        case 'pages':
          res.json(pagesEndpoint(hits));
          break;
        case 'referrers':
          res.json(referrersEndpoint(hits));
          break;
        case 'profiles':
          res.json(profilesEndpoint(hits));
          break;
        case 'browsers':
          res.json(browsersEndpoint(hits));
          break;
        case 'os':
          res.json(osEndpoint(hits));
          break;
        case 'devices':
          res.json(devicesEndpoint(hits));
          break;
        case 'regions':
          res.json(regionsEndpoint(hits));
          break;
        default:
          res.status(404).json({ error: 'Unknown endpoint' });
      }
    } catch (err) {
      console.error('Dashboard error:', err.message);
      res.status(500).json({ error: 'Internal error' });
    }
  };
}

module.exports = { dashboardHandler };
