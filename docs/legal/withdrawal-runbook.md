# Withdrawal runbook: an unsafe or wrong activity

Item: [TSA-045](../specs/global/14-trust-safety-accessibility-privacy.md) (response to an unsafe or wrong activity). Related: [TSA-035](../specs/global/14-trust-safety-accessibility-privacy.md) (corrections log) and [TSA-047](../specs/global/14-trust-safety-accessibility-privacy.md) (safety report route).

**Status: DRAFT for maintainer sign-off.** Owners and response targets are **TO SET**. The drill that TSA-045 asks for has not been run. Nothing here is a public promise of a response time. The corrections page says response times are not yet published (`site/src/pages/corrections.astro`).

---

## 1. The five steps, and how the repository does each one today

TSA-045 gives five steps. The table maps each one to what the code does now, and to what is still manual.

| # | Step (TSA-045) | What the repository does today | What is still manual | Owner | Response target |
|---|---|---|---|---|---|
| 1 | **Hold the card.** Add `withdrawn` to its front matter, and `replacement` if a corrected version exists. | The schema `withdrawnSchema` in `site/src/lib/activity-schema.ts` takes `date`, `reason` (40 to 400 characters) and an optional `replacement` (up to 120 characters). `activity-schema.test.ts` checks it. | An editor adds the block to the card's front matter. Nothing else is triggered. | TO SET | TO SET (TSA-045: same day, target set by maintainer) |
| 2 | **Rebuild and check** that the card's page shows the notice and is noindex, and that the slug is gone from the finder, sitemap, `llms.txt` and every hub and pack. | `listedActivities()` in `site/src/lib/activities.ts` drops withdrawn cards. It is used by the finder, hubs, packs, home, guide and game pages, the sitemap (`sitemap-entries.ts`), `llms.txt`, `llms-full.txt`, `search-index.json` and the large-print pages. `ActivityView.astro` shows the notice and sets `noindex`. `activity/pack.astro` never prints a withdrawn card. `care-settings.astro` throws a build error if a withdrawn card is in its list, so the build stops instead of printing it. | Someone checks the rebuilt site for the slug. Tell the maintainer if a hub or pack is left too thin. | TO SET | TO SET |
| 3 | **Log the change** in the corrections log (TSA-035) with the date and reason. | `site/src/lib/corrections.ts` holds the `CORRECTIONS` array, shown on `/corrections/`. | **Manual.** Adding the withdrawal does not add a log entry. The editor adds one. | TO SET | TO SET |
| 4 | **Tell partners** who use the activity. Printed copies carry their version and date. Publish a notice for the version that is wrong. | The print footer is specified to show version and date (`15-platform-data-architecture.md`, print section). The withdrawal notice on the page says "Please do not print or use this card." | **Manual.** The repository has no partner list. Who to tell is **TO SET**. The printed-notice process is **TO SET**. Check the footer on the printed card before relying on it. | TO SET | TO SET |
| 5 | **Fix the card.** Remove `withdrawn` only after a second person has checked the fix, and log the reinstatement. | The reinstatement is a front-matter change. No tool checks for a second reviewer. | **Manual.** Second-person check and the reinstatement log line. | TO SET | TO SET |

---

## 2. Exact front-matter example

The block below follows `withdrawnSchema` in `site/src/lib/activity-schema.ts`. The `reason` is shown to readers on the page. Say what was wrong, not who reported it. Keep it between 40 and 400 characters.

```yaml
withdrawn:
  date: 2026-11-21
  reason: "Step 3 says to light a candle near the table. That step is removed while the card is checked and fixed."
  replacement: "A corrected version of this card will be published after review."
```

Notes on the example:

- `date` is coerced to a date by the schema. Use `YYYY-MM-DD`.
- `replacement` is plain text, not a link. The schema has no slug field, so the replacement cannot link to another card. Name the replacement in words if one exists.
- Do not add reporter names, contact details or the report's wording. The schema allows no reporter field.
- The example reason is 103 characters, within the 40 to 400 range. The `replacement` is 64 characters, within the 120 limit.

---

## 3. What a withdrawn card looks like to a reader

- The URL stays live, so links and printed references do not break.
- The page shows the title, a "Withdrawn" label, the notice heading, the reason, the withdrawal date, and the replacement sentence if one is given.
- The page is `noindex`.
- The card is removed from every list, search index, sitemap and language file listed in section 1. Related activities and guides are not shown on the page.

No redirect is set up for a withdrawn card. The URL stays live and shows the notice.

---

## 4. Gaps against TSA-045

These are open. Each needs a person.

1. **Owners and targets.** Named owners and a same-day response target are not in the repository.
2. **Drill.** TSA-045 asks for one drill before the S1 gate, with the outcome recorded. Not run.
3. **Corrections log is manual.** Step 3 relies on a person.
4. **Partner list.** No list exists in the repository.
5. **Safety report route.** TSA-047 says the monitored address needs maintainer confirmation.
6. **Second-person check.** No tool enforces it.

---

## 5. Change log

| Date | Change | By |
|---|---|---|
| 2026-11-21 | Runbook drafted from TSA-045 and the current code. Owners and targets left as TO SET. | TO SET |
