// WEB-031: the weekly plans print on their own, with the path itself left off the paper. The attribute is
// read only by the print styles in PathView.astro, and is removed when the print dialog closes.
// A same-origin file (allowed by script-src 'self'), so the pages need no new inline-script hash in the CSP.
const tools = document.querySelector('[data-plan-tools]');
const button = document.querySelector('[data-print-plan]');
if (tools && button) {
  tools.hidden = false;
  button.hidden = false;
  button.addEventListener('click', () => {
    document.body.dataset.printPlan = 'true';
    window.print();
  });
  window.addEventListener('afterprint', () => {
    delete document.body.dataset.printPlan;
  });
}
