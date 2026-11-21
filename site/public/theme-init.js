// Applies the reader's Colors choice (WEB-042) and reading settings (line length
// and spacing) before the first paint. It is a separate file from this site, so
// the Content-Security-Policy needs no hash. Keep the keys in step with
// THEME_KEY, LINE_LENGTH_KEY and SPACING_KEY in src/lib/display-settings.ts (a test checks them).
(function () {
  var root = document.documentElement;
  try {
    var choice = localStorage.getItem('gm-theme');
    if (choice === 'light' || choice === 'dark') {
      root.setAttribute('data-theme', choice);
    }
  } catch (e) {
    /* storage blocked: the device setting applies */
  }
  try {
    if (localStorage.getItem('gm-line-length') === 'short') root.setAttribute('data-line', 'short');
    if (localStorage.getItem('gm-spacing') === 'more') root.setAttribute('data-spacing', 'more');
  } catch (e) {
    /* storage blocked: standard lines and spacing apply */
  }
  try {
    // The analytics question (TSA-011): mark the page before the first paint when the consent bar should
    // show, so it does not appear late and push the page down. Same rule as showConsentChoice() in
    // src/lib/consent.ts: no stored answer and no Global Privacy Control. Keep CONSENT_KEY in step (a test checks it).
    var answer = null;
    try {
      answer = localStorage.getItem('ca-analytics-consent-v1');
    } catch (e) {
      answer = null;
    }
    var gpc = typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true;
    if (!gpc && answer !== 'granted' && answer !== 'denied') root.setAttribute('data-consent-ask', '');
  } catch (e) {
    /* the bar's own script still decides after load */
  }
})();
