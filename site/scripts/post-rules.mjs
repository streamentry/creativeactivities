// What TSA-044 forbids until its controls exist (server checks, a rate limit, a honeypot and a test with a screen reader):
// a form that sends data to a server, and a captcha service. These read built HTML, so check-site.mjs and a test share them.

/**
 * A form, or a button or input inside one, that says where or how it sends. Spaces around the equals sign and a
 * `formaction` or `formmethod` on a button are the same thing as an `action` or `method` on the form.
 */
export function postingForm(html) {
  return /<form\b[^>]*\s(?:action|method)\s*=/i.test(html) || /<(?:button|input)\b[^>]*\sform(?:action|method)\s*=/i.test(html);
}

/** A captcha service loaded by a script or a frame. It looks at where the file comes from, not at the words in the page. */
export function captchaLoaded(html) {
  return /<(?:script|iframe)\b[^>]*\ssrc\s*=\s*["'][^"']*(?:captcha|turnstile)/i.test(html);
}
