# Analytics consent

**Decision (maintainer, 2026-11-15):** keep Google Analytics 4 through Google Tag Manager, but make it consent-aware: a short, calm choice with "no" as the easy default, Google consent mode, and Tag Manager's automatic click and form tracking turned off. This resolves the open question between the live GA4 setup and DESIGN.md §7 ("Avoid third-party trackers … Keep anonymized analytics minimal and consent-aware where required").

Read with [data-inventory.md](data-inventory.md), [events.md](events.md) and items WEB-068, WEB-069, TSA-011, TSA-014 and TSA-018 in [03](03-features-web.md) and [14](14-trust-safety-accessibility-privacy.md).

## How it works on the site

| Situation | What loads from Google | Cookies |
|---|---|---|
| First visit, no answer yet | Nothing | None |
| "No thanks", no answer, or JavaScript off | Nothing | None |
| "Allow" | Tag Manager (`gtm.js`), then GA4 as configured in the container | `_ga`, `_ga_<stream>` (Google's) |
| "Allow", then later "No" (privacy page) | Consent mode updated to denied on the open page; nothing loads on later pages | `_ga*` cookies deleted from this browser |
| Browser sends Global Privacy Control | Nothing, even after an earlier "Allow"; the question is not shown | None |
| Photo pairs | Never | None |
| Scrapbook | Never | None |

- **The question:** `site/src/components/ConsentBar.astro`, a bar at the top of the page in normal flow (not a dialog, never pinned over content, so it cannot hide keyboard focus). "No thanks" comes first; both buttons are the same size. It shows only while the question is unanswered.
- **The answer:** `ca-analytics-consent-v1` in local storage (`granted` or `denied`), listed on `/your-data/`, where deleting it makes the site ask again. Changeable at any time on `/privacy/#analytics-choice`.
- **The loader:** `site/src/lib/consent-runtime.ts` starts Tag Manager only after "Allow", pushing, in this order: consent default (all denied), consent update (analytics storage granted; `ad_storage`, `ad_user_data` and `ad_personalization` stay denied), `gtm.blocklist`, then `gtm.start`.
- **The blocklist** (`site/src/lib/consent.ts`, `GTM_BLOCKLIST`): Tag Manager may never run click (`cl`), link click (`lcl`), form submit (`fsl`), element visibility (`evl`), scroll depth (`sdl`), timer (`tl`), history (`hl`), JavaScript error (`jel`) or YouTube (`ytl`) listeners, or Custom HTML tags (`html`), whatever the container says. GA4 tags are not blocked.
- **Events:** `track()` sends only when Tag Manager is loaded, so before or without consent every event is dropped. The allowlist in [events.md](events.md) still applies after consent.

Evidence: `consent.test.ts` (10 tests), `your-data.test.ts`, `data-inventory.test.ts`; a browser test with the real `_headers` (20 checks, all passing on 2026-11-15): nothing requested from Google and no cookie on a first visit; "No thanks" persists; "Allow" loads Tag Manager with the order above; saying no on the privacy page removes `_ga` cookies and updates consent mode; photo pairs has no bar; 0 CSP violations. `pnpm check:a11y`: 0 failing of 94 page checks with the bar showing.

## What only the maintainer can change (Google consoles)

The blocklist stops Tag Manager's own listeners, but some collection is configured inside Google's products, not in this repository:

1. **GA4 › Admin › Data streams › (web stream) › Enhanced measurement:** turn **off** "Form interactions", "Outbound clicks" and "Site search". (Keep "Page views". Scrolls, video engagement and file downloads are optional; off is closest to DESIGN.md.)
2. **GA4 › Admin › Data collection:** confirm Google signals is **off**, and granular location and device data collection is limited where offered.
3. **GA4 › Admin › Data retention:** set event data retention to **2 months** (the shortest standard option), unless the retention policy decides otherwise (see `docs/legal/retention-and-data-requests.md`).
4. **Tag Manager container `GTM-5ZSV72WC`:** remove any Click, Link Click, Form Submission, Scroll Depth, Element Visibility, Timer or History Change triggers and any Custom HTML tags (the site blocks them anyway, but the container should match); make sure the GA4 tag uses the built-in consent check ("Require additional consent": none needed beyond `analytics_storage`).
5. **Verify in a clean browser profile** with Tag Assistant: before "Allow", no requests to Google; after "Allow", consent shows `analytics_storage: granted`, `ad_storage: denied`.

### Console state, set on 2026-11-21

Property creativeactivities.org (stream `16331161065`, measurement ID `G-JX0SFMN3B0`). Every change was saved and read back after a page reload.

| Step | Before | Now |
|---|---|---|
| 1. Enhanced measurement | All seven events on | Page views only. Scrolls, outbound clicks, site search, form interactions, video engagement and file downloads are off |
| 2. Google signals | Off | Off (unchanged) |
| 2. Granular location and device data | Allowed in 307 of 307 regions | Off everywhere. Country and region are still collected |
| 2. Ads personalization | Allowed in 307 of 307 regions | Allowed in 0 of 307 (the site already denies `ad_personalization`) |
| 2. User-provided data collection | Off | Off (unchanged) |
| 3. Event data retention | 2 months | 2 months (unchanged) |
| 3. User data retention | 14 months, reset on new activity | 2 months, no reset on new activity |
| 4. Container `GTM-5ZSV72WC` triggers and tags | One tag: Google Analytics `G-JX0SFMN3B0`, trigger "Initialization – All Pages". No other triggers, no Custom HTML | Unchanged; already matches step 4 |
| 4. Google tag › automatic event detection | Page views on history change, scrolls, outbound clicks, form interactions, video engagement and file downloads all on (`__ogt_auto_events`; the site's blocklist does not cover these) | All six off |
| 4. Google tag › user-provided data capabilities | On, with automatic email, phone and address detection (`__ogt_1p_data_v2`) | Off |

The two Google tag settings were published as container version 2 ("Privacy: automatic events and user-provided data off"). The `gtm.js` that Google served afterwards shows every `__ogt_auto_events` option `false` and `__ogt_1p_data_v2` with `vtp_isEnabled: false`, and the `DEVICE_AND_GEO` and `GOOGLE_SIGNALS` redaction set for all regions.

**Step 5, checked in a browser on the live site on 2026-11-21** (the in-app browser with the stored answer removed, not a fresh profile, and the network list read from the page, not Tag Assistant):

- No answer stored: the question shows, there is no `dataLayer`, and nothing is requested from Google.
- "Allow" stored: the consent default is all denied, then the update grants only `analytics_storage` (`ad_storage`, `ad_user_data` and `ad_personalization` stay denied). After that, `gtm.js` and `g/collect` load.

## Open

- The consent words exist in English only; other languages show the English text until their dictionaries are translated and reviewed (L10N rules).
- Counsel should confirm the wording is sufficient for consent where it is required (UK, EU and some US states).
