# Website event dictionary (PLAT-024, TSA-012)

Status: draft for maintainer review. Code: `site/src/lib/track.ts` (`EVENT_DICTIONARY`). A test (`site/src/lib/track.test.ts`) fails if this table and the code differ.

## Rules

- `track()` is the only path for activity events. It drops any event name not listed here, any property not listed for that event, and any value outside its rule. A missing or disallowed listed property drops the whole event.
- No free text in any event. Every property is a fixed value or a lowercase slug (`[a-z0-9-]`, the activity's own key from its URL).
- No health words, diagnosis, medication, care level, child or participant names, person descriptions, user IDs, cookies or account data.
- Page URLs are never sent as full URLs. Only the activity key goes out, not the address.
- The event carries the card key and the choice only (WEB-025, WEB-026).
- Each new event needs a metric in [17-metrics-and-evidence.md](17-metrics-and-evidence.md) before it is added here.

## Events

| Event | Parameters | Allowed values | Sent when |
|---|---|---|---|
| `activity_start` | none | none | First time the visitor starts a game board on a page view |
| `activity_restart` | none | none | A game's restart button is used |
| `activity_done` | none | none | A game's done link is used |
| `activity_print` | none | none | Printing a game page that has a printable sheet |
| `activity_feedback` | `answer` | `yes`, `not_really` | Answer to the game's "did it help" question |
| `activity_started_confirmed` | `activity` | activity key (lowercase slug) | "We tried this" on an activity page (WEB-025). Once per activity per browser |
| `activity_not_a_fit` | `activity`, `reason` | activity key; `reason` one of `too_messy`, `too_hard`, `needs_materials`, `not_interested`, `too_loud_or_busy`, `hard_to_read_or_use`, `other` | "This didn't fit" submitted on an activity page (WEB-026) |

## Not yet sent (TSA-012 names that have no code yet)

`activity_view`, `activity_save`, `activity_share`, `app_cta_click` appear in TSA-012 but are not in the dictionary. Add each one here and in code together, with its metric, before it is wired.

## Transport and the open decision

- `track()` sends to `window.gtag` when present, otherwise pushes `{ event, ...params }` to `window.dataLayer`. The Google Tag Manager container in `Analytics.astro` (set up 2026-11-13) exposes `dataLayer`, not `gtag`.
- Whether any vendor runs at all is a maintainer decision. It is open in [14-trust-safety-accessibility-privacy.md](14-trust-safety-accessibility-privacy.md) (open question 1) and [WEB-068](03-features-web.md). Nothing here adds or removes a vendor. If the decision is "no tracker", remove the GTM snippet in `Analytics.astro`; `track()` then does nothing.
- If GA4 stays, configure it inside the container with Google signals and ad personalization off (PLAT-024, PLAT-026), and honor Global Privacy Control before sending (PLAT-026).

## Other consumers

- `site/src/games/shared/GameFrame.tsx` uses `activity_start`, `activity_restart`, `activity_done`, `activity_feedback`, and `trackPrint`.
- The game feedback question is shown only when `analyticsAvailable()` is true, so it now appears wherever the GTM `dataLayer` exists, not only where `gtag` exists.
