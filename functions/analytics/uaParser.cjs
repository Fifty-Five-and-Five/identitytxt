// Lightweight user agent parser
'use strict';

function parseUA(ua) {
  if (!ua) return { browser: 'Unknown', browserVersion: '', os: 'Unknown', device: 'unknown' };

  var browser = 'Other';
  var browserVersion = '';
  var os = 'Other';
  var device = 'desktop';

  // Browser detection (order matters: Edge before Chrome, Chrome before Safari)
  var m;
  if ((m = ua.match(/Edg(?:e|A|iOS)?\/(\d+[\d.]*)/))) {
    browser = 'Edge'; browserVersion = m[1];
  } else if ((m = ua.match(/OPR\/(\d+[\d.]*)/)) || (m = ua.match(/Opera\/(\d+[\d.]*)/))) {
    browser = 'Opera'; browserVersion = m[1];
  } else if ((m = ua.match(/SamsungBrowser\/(\d+[\d.]*)/))) {
    browser = 'Samsung Internet'; browserVersion = m[1];
  } else if ((m = ua.match(/Firefox\/(\d+[\d.]*)/))) {
    browser = 'Firefox'; browserVersion = m[1];
  } else if ((m = ua.match(/Chrome\/(\d+[\d.]*)/)) && !/Chromium/.test(ua)) {
    browser = 'Chrome'; browserVersion = m[1];
  } else if ((m = ua.match(/Version\/(\d+[\d.]*).*Safari/))) {
    browser = 'Safari'; browserVersion = m[1];
  } else if (/Safari\//.test(ua) && /AppleWebKit/.test(ua)) {
    browser = 'Safari'; browserVersion = '';
  }

  // OS detection
  if (/CrOS/.test(ua)) {
    os = 'Chrome OS';
  } else if ((m = ua.match(/Windows NT (\d+\.\d+)/))) {
    os = 'Windows';
  } else if (/Mac OS X/.test(ua) && !/iPhone|iPad|iPod/.test(ua)) {
    os = 'macOS';
  } else if (/Android/.test(ua)) {
    os = 'Android';
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    os = 'iOS';
  } else if (/Linux/.test(ua)) {
    os = 'Linux';
  }

  // Device detection
  if (/Mobile|Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Opera Mobi/i.test(ua)) {
    device = 'mobile';
  } else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) {
    device = 'tablet';
  }

  return { browser: browser, browserVersion: browserVersion, os: os, device: device };
}

module.exports = { parseUA };
