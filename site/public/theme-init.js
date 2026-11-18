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
})();
