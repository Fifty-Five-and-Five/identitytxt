// identity.txt pageview tracker
// No cookies, no fingerprinting, respects Do Not Track
(function () {
  'use strict';

  // Respect Do Not Track
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;

  var endpoint = '/api/t';

  function getUTM(name) {
    try {
      return new URL(location.href).searchParams.get(name) || '';
    } catch (e) {
      return '';
    }
  }

  function send() {
    var data = {
      type: 'pageview',
      u: location.pathname,
      t: document.title,
      r: document.referrer,
      s: screen.width + 'x' + screen.height,
      l: navigator.language || '',
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      us: getUTM('utm_source'),
      um: getUTM('utm_medium'),
      uc: getUTM('utm_campaign')
    };

    var payload = JSON.stringify(data);

    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([payload], { type: 'application/json' }));
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(payload);
    }
  }

  // Initial pageview
  send();

  // SPA support: intercept history changes
  var origPushState = history.pushState;
  var origReplaceState = history.replaceState;

  history.pushState = function () {
    origPushState.apply(this, arguments);
    setTimeout(send, 10);
  };

  history.replaceState = function () {
    origReplaceState.apply(this, arguments);
    setTimeout(send, 10);
  };

  window.addEventListener('popstate', function () {
    setTimeout(send, 10);
  });
})();
