// BIZ-018: child-directed pages carry no purchase, donation, subscription or price prompts, and no link
// that leads to checkout. Shared by check-site.mjs (built HTML in dist/) and a vitest source test.
// Patterns follow the spec's acceptance: "Child-directed pages contain no purchase prompts" and
// "Checkout pages are not reachable from child-directed pages without an adult step". They are matched
// against English wording and against URLs and currency markers, which are the same in every language.
// Translated wording is not matched; the BIZ-018 status note records that open point.

/** A call to buy, donate, subscribe or upgrade that is aimed at us, or a checkout, cart or price. */
export const PURCHASE_PROMPTS = [
  ['checkout', /\bcheck-?out\b/i],
  ['cart', /\badd to (?:cart|basket|bag)\b/i],
  ['buy from us', /\bbuy (?:now|from us|our|the full|the printed|a printed|this pack|a pack|the app|this app|an app|our book)\b/i],
  ['donation', /\bdonat(?:e|es|ed|ing|ion|ions)\b[^.!?\n]{0,40}\b(?:to us|us now|us today|now|today|our work|this site|this website)\b/i],
  ['donation ask', /\bmake (?:a|an|your) (?:donation|gift)\b|\bgive (?:a )?(?:donation|gift) to\b/i],
  ['support ask', /\bsupport (?:us|our work|this site|this website)\b/i],
  ['membership ask', /\bbecome (?:a|an) (?:supporter|member|patron|subscriber)\b|\bjoin (?:as )?(?:a|our) (?:supporter|member|membership)\b/i],
  ['subscription', /\bsubscribe (?:now|today)\b|\bsubscription (?:plan|plans|box|boxes|price|prices|offer|offers|now)\b|\b(?:premium|paid|plus) (?:plan|plans|subscription|membership)\b/i],
  ['upgrade', /\bupgrade (?:now|to (?:premium|plus|pro|the full|the paid))\b|\bgo premium\b|\bunlock (?:the )?(?:full|premium|paid) (?:version|game|games|packs?)\b/i],
  ['in-app purchase offer', /\bin-app purchases? (?:are|is) (?:available|offered|needed)\b|\bunlock (?:with|by) (?:an? )?(?:in-app )?purchase\b/i],
  ['price', /\bpricing\b|\bprice list\b|\bprices? (?:start|starts|from)\b|\bpriced (?:at|from)\b|\bcosts? (?:\$|£|€)/i],
  ['currency amount', /[$£€¥₹]\s?\d|\b\d[\d,.]*\s?(?:USD|GBP|EUR|AUD|CAD)\b/],
];

/** Hosts that take payment or collect donations. A child-directed page links to none of them. */
export const COMMERCE_HOST =
  /^https?:\/\/(?:[\w-]+\.)*(?:amazon|amzn|etsy|ebay|paypal|stripe|shopify|gumroad|patreon|ko-fi|buymeacoffee|gofundme|justgiving|donorbox|squareup|sumup|checkout)\.[a-z.]+(?:\/|$|\?|#)/i;

/** Paths on this site for checkout, cart, donation or price. A language prefix may come first. */
export const COMMERCE_PATH =
  /^(?:\/[a-z]{2,3}(?:-[a-z]{2,4})?)?\/(?:checkout|cart|basket|buy|donate|donation|shop|subscribe|subscription|pricing|premium|upgrade)(?:\/|$|\?|#)/i;

/** Words that make a match a denial ("no in-app purchases", "without a subscription"). Denied matches are not prompts. */
const DENIAL = /\b(?:no|not|never|without|nothing|nor|free of|isn['’]t|doesn['’]t|don['’]t|cannot|can['’]t|neither)\b/i;

/** Each purchase, donation or price prompt in visible text, with its label. */
export function purchasePrompts(text) {
  const found = [];
  for (const [label, re] of PURCHASE_PROMPTS) {
    for (const m of text.matchAll(new RegExp(re.source, `${re.flags.replace('g', '')}g`))) {
      const before = text.slice(Math.max(0, m.index - 60), m.index).split(/[.!?;:\n]/).pop() ?? '';
      if (!DENIAL.test(before)) found.push({ label, match: m[0] });
    }
  }
  return found;
}

/** The hrefs that lead to a commerce host or a checkout-type path on this site. */
export function commerceLinks(hrefs) {
  return hrefs.filter((href) => COMMERCE_HOST.test(href) || COMMERCE_PATH.test(href));
}
