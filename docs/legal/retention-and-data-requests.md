# Retention, deletion and data requests (DRAFT)

Item: [TSA-016](../specs/global/14-trust-safety-accessibility-privacy.md) (retention, deletion and data requests).

**Status: DRAFT for maintainer and counsel sign-off. Not approved, not published.** Nothing here is a promise to the public. Do not copy any period, timeline or process into the privacy notice or the app until the maintainer approves it and counsel has checked it. Items marked **TO SET** need a decision first.

Checked 2026-11-15 against [data-inventory.md](../specs/global/data-inventory.md). The website and app have no user accounts and no server that stores personal data. The only stores of personal data we hold are the support mailbox and the analytics account described below.

---

## 1. Retention schedule

| Data | Where it is kept | Who holds it | Kept for | How it is deleted | Notes |
|---|---|---|---|---|---|
| Emails to the support address (requests, corrections, safety reports, feedback) | The support mailbox | The maintainer | **TO SET.** Proposed: delete once the matter is closed, and no later than a fixed number of months after it is closed | Delete from the mailbox, its trash and any backup the mail host keeps | Counsel to confirm the period, and whether a safety report needs longer. |
| Website on-device data (saved activities, tried marks, Today notes, text size, contrast, game sound, language choice) | The reader's browser | The reader | Until the reader removes it | The reader uses [Your data on this device](/your-data/), or clears site data | We hold no copy. Covered by `site/src/lib/your-data.test.ts`. |
| App on-device data (SharedPreferences keys and family photo copies) | The reader's device | The reader | Until the reader removes it or deletes the app | Steps in [privacy choices](/privacy-choices/) | We hold no copy. |
| Google Analytics 4 event data (sent through Google Tag Manager) | Google | Google, for the maintainer's account | 2 months for event data and user data, with no reset on new activity (set in the GA4 console on 2026-11-21; see [analytics-consent.md](../specs/global/analytics-consent.md)) | Google's data deletion tools, and the retention setting | Open maintainer decision in [data-inventory.md](../specs/global/data-inventory.md), section 6. |
| Request logs at the website host (Cloudflare) | Cloudflare | Cloudflare | Per Cloudflare's policy. **TO VERIFY** in the dashboard | Not under our control; say so in the privacy notice | Observability is disabled in `site/wrangler.jsonc`. |
| Store listings and store reviews | Apple App Store, Google Play | Apple, Google | Per each store's policy | Each store's own tools | We do not hold reviewers' data. |
| Backups of the mailbox or the repository | The mail host and the git host | Those providers | **TO VERIFY** | Provider's tools | Check that deleted mail does not stay in a backup for longer than the schedule allows. |

Email lists: none exist. Do not start one without adding it to this schedule first.

---

## 2. Deletion route for each store

- **Support mailbox:** the maintainer deletes the messages, their trash copies, and the matching request-log entry (below) once the schedule allows.
- **Analytics:** the maintainer uses Google's deletion tools for the property. Any individual request that depends on the analytics data is answered by counsel's advice.
- **On-device data:** the reader removes it. The website provides that tool. The app provides steps.
- **Store data:** the store's own process. We point the reader to it.

A deletion counts as tested only when someone has run it end to end for that store and recorded the date below. **Not yet tested:** the support mailbox, the analytics property, and the host's log deletion. The on-device route has automated tests but no manual run recorded yet.

---

## 3. Data request process

**Owner:** **TO SET** (name and role of the maintainer, or a delegate).

**Intake:** the support address in [the privacy notice](/privacy/) and [privacy choices](/privacy-choices/). Forms are not used.

**Steps:**

1. Log the request (fields below) on the day it arrives.
2. Confirm it is from the person it concerns. Ask for the least information needed. Do not ask for identity documents, medical records or photos. This matches what the site already tells people.
3. Find what the request concerns, using the inventory and this schedule. Say what we hold, if anything.
4. Act: give access, correct, delete, or explain why a legal exception applies. Counsel decides on exceptions.
5. Reply in plain words. Record the date sent and the outcome.

**Time limits:** **TO CONFIRM WITH COUNSEL.** For reference only, the EU GDPR allows one month, extendable in some cases. Other laws, including US state privacy laws, set their own periods. Counsel should list the laws that apply to us.

**Children:** a request about a child, or from a child, needs counsel's advice before any action.

**Request log (kept outside the repository, because it holds personal data):**

| Field | Example |
|---|---|
| Reference | `DR-2026-001` |
| Date received | |
| Type | access, correction, deletion, objection, other |
| Identity checked by and how | |
| Action taken | |
| Date replied | |
| Date closed | |
| Counsel consulted (yes or no) | |

---

## 4. Open items

1. Retention period for support email (TO SET). Analytics is set to 2 months.
2. Name the owner of requests (TO SET).
3. Counsel review of time limits, applicable laws and the wording of replies.
4. Manual deletion runs for each store, with dates.
5. Decide whether the schedule goes into the privacy notice (TSA-017), after approval.
