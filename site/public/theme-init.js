// Applies the reader's Colors choice (WEB-042) before the first paint. It is a
// separate file from this site, so the Content-Security-Policy needs no hash.
// Keep the key in step with THEME_KEY in src/lib/display-settings.ts (a test checks it).
(function () {
  try {
    var choice = localStorage.getItem('gm-theme');
    if (choice === 'light' || choice === 'dark') {
      document.documentElement.setAttribute('data-theme', choice);
    }
  } catch (e) {
    /* storage blocked: the device setting applies */
  }
})();
