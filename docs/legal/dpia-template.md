# Data protection impact assessment (DPIA) template

Item: [TSA-013](../specs/global/14-trust-safety-accessibility-privacy.md) (special-category data posture).

**Template; counsel to confirm. Not legal advice.** The legal points here are general guidance. Counsel must confirm the trigger list, the lawful basis and the sign-off route before any DPIA is relied on.

Copy this file to a new file for each feature, for example `docs/legal/dpia-<feature>.md`, and fill every section. Leave a section as "Not applicable" only with a reason.

---

## 0. When a DPIA is required

Start a DPIA **before design begins** (TSA-013) when a feature does any of these:

| Trigger | Why it matters here | Source |
|---|---|---|
| Collects or infers health data, a diagnosis, a stage, a medication, a care level or a cognitive measure | Health data is special-category data under GDPR Article 9(1) | TSA-013 |
| Could let a person be identified from data about a person who is ill, frail or in care | Same risk, indirectly | TSA-013, MET-037 |
| Involves children, or anything a child can reach or use | Children need extra care, and some pages are child-reachable | TSA-021, TSA-013 |
| Adds analytics, a tracker, a new SDK, crash reporting or any new telemetry | The project has no analytics SDK in the app by decision; any new one needs a documented privacy decision first | AGENTS.md (non-negotiable boundaries), MET-037 |
| Imports, stores, shows or sends family photos, EXIF or other images of people | Photos are personal data and must stay on the device unless the person chooses | TSA-015, offline-photos spec |
| Adds accounts, cloud sync, sharing between people, or any server that stores personal data | Changes where data lives | AGENTS.md, retention-and-data-requests.md |
| Adds a third-party script, font or outside origin | Changes what leaves the device | TSA-042, data-inventory.md section 4 |

If none applies, write one line in the feature record saying so, with the date and the reviewer's name. TSA-013 says a feature that "might" collect health data also needs the assessment. When unsure, do the DPIA.

---

## 1. Feature summary

- **Feature name:**
- **Where it runs:** website / app (iOS, Android) / both / other:
- **Owner (name and role):** TO SET
- **Date started:** YYYY-MM-DD
- **Related items:** (spec IDs, pull request or branch)
- **Status:** draft / under review / approved / rejected

## 2. Purpose

What the feature does for the person, in one or two plain sentences. What it does not do.

Check against the product rule: the activity is the goal, and the feature does not diagnose, score, or track people.

## 3. Data

Fill one row per item of data. Use the same words as the data inventory.

| Data item | Who it is about (reader, caregiver, child, other) | Source | Stored where (device, browser, server, vendor) | Sent off the device? (yes or no, and to whom) | Kept for | Special category? (health, child, other) |
|---|---|---|---|---|---|---|
| | | | | | | |

Also state:

- Whether any free text is collected. If so, why it cannot be a fixed choice.
- Whether any event names, tags or reason codes could reveal a health detail.
- Whether the data is linked to any other data, and where.

## 4. Lawful basis (for counsel)

- **Lawful basis under GDPR Article 6:** [placeholder for counsel]
- **Article 9 condition, if special-category data is involved:** [placeholder for counsel]
- **Consent needed?** yes / no / counsel to decide. If yes, the consent route must follow [analytics-consent.md](../specs/global/analytics-consent.md).
- **Other laws counsel says apply (US state laws, UK, others):** [placeholder for counsel]

Do not fill this section from memory of the law. Leave the placeholder until counsel answers.

## 5. Necessity and proportionality

- Could the goal be met without the personal data? Say how.
- What is the smallest data set that works?
- How long is each item needed? Is there a shorter period that still works?
- Does the feature need person-level data, or will aggregate counts do? If person-level data is needed, the MET-037 rule says it goes to the maintainer as a decision.

## 6. Risks

List each risk to the person, not to the project. Rate likelihood and harm as low, medium or high.

| # | Risk | Who could be harmed and how | Likelihood | Harm | Before mitigation |
|---|---|---|---|---|---|
| R1 | | | | | |

Typical risks for this project: a family photo leaves the device; a caregiver's note reveals a diagnosis; a child's name or image is published; a tracker sets a cookie before the person agrees; a small group becomes identifiable in a report.

## 7. Mitigations

For each risk, say what is done, where it is done (file, setting or process), and how it is checked (test, trace or review).

| Risk # | Mitigation | Where | How checked | Residual risk |
|---|---|---|---|---|
| R1 | | | | low / medium / high |

Good evidence is a test in the repository, a recorded network trace, or a reviewer's dated note. A claim in the text of a DPIA is not evidence on its own.

## 8. Consultation

- People who will use the feature, or their caregivers, consulted? (who, when, what they said)
- Counsel consulted? (who, date, answer)
- Reviewer for the child-development or older-adult content, if relevant: TO SET

## 9. Decision and sign-off

| Role | Name | Decision (approve, approve with conditions, reject) | Date |
|---|---|---|---|
| Maintainer (product owner) | TO SET | | |
| Counsel review recorded | TO SET | | |
| Technical reviewer | TO SET | | |

Conditions of approval:

1.

Review date (a DPIA is reviewed when the feature changes, and at least once a year): YYYY-MM-DD

---

## Worked example: Photo pairs (web) and family photos (app)

This example is applied to a feature already in the repository. It shows how the sections are filled. It is not a finished assessment, and counsel has not reviewed it.

**Feature:** Family photos used in the Photo pairs game (website, `/games/photo-pairs/`) and the family photo collection in the app (`family_photos_v1`).

### 1. Feature summary

- **Where it runs:** website game and the native app.
- **Owner:** TO SET.
- **Status:** draft, worked example only.

### 2. Purpose

The person chooses some of their own photos. The game shows them in a memory-matching activity, or the app keeps them as picture cards for a shared activity. Nothing is scanned, and nothing is uploaded.

### 3. Data (summary)

| Data item | About | Stored where | Sent off the device? | Kept for | Special category? |
|---|---|---|---|---|---|
| Photos the person explicitly picks (up to 24 in the app) | Reader, and the people in the photos | App: working copies in the app's support folder (`family_photos_v1/`, see [data-inventory.md](../specs/global/data-inventory.md) section 2b). Web: local to the browser | No. TSA-015 says photos never leave the device unless the person chooses | Until the person removes them ([privacy choices](/privacy-choices/)) | Photos of people can show health or care needs, so treat as sensitive |
| Optional captions on the photos (app) | Reader | Same folder, sidecar file | No | As above | Free text could hold a health detail; the app should not analyze it |
| Analytics events | None | None. Photo pairs loads no analytics and `track()` does nothing on that page (data-inventory section 3) | No | Not applicable | No |

### 5. Necessity

Explicit selection is the only way in. The app bounds the collection to 24 photos and normalizes each copy to at most 1024 by 1024 pixels. The offline-photos spec says the picker is set to `requestFullMetadata: false`, the pixels are re-encoded, and no EXIF or GPS data is indexed. Whether the stored copies carry no metadata at all is not stated in the spec and is an open check.

### 6. Risks and 7. Mitigations (examples)

| # | Risk | Mitigation in the repository | How checked | Residual risk |
|---|---|---|---|---|
| R1 | A photo or its metadata is uploaded | Photo pairs makes no analytics call; no upload path is described in the offline-photos spec | TSA-015 asks for a network trace on each platform. **No trace is recorded in the repository yet.** | Medium until the trace is recorded |
| R2 | Original photos are changed or deleted | Originals are never modified; deletion is limited to app-owned copies (offline-photos spec) | Adversarial storage tests described in the spec. Device QA still needed | Low to medium |
| R3 | A caption reveals a diagnosis | Captions are free text on the device only; they are not sent anywhere | Not tested for content. Captions are the person's own words | Medium; the reader decides what to write |
| R4 | A damaged collection is silently reset, losing a person's photos | Corrupt manifests are set aside, not overwritten, and only on request | Injected failure tests (offline-photos spec) | Low |
| R5 | The app's photo permission text says more or less than the app does | TSA-015 requires permission text that matches the behavior | Reviewer check in each language. **Not yet confirmed in the repository** | Medium until reviewed |

### 9. Sign-off

Not signed. The worked example needs: the network trace (R1), the permission-text review (R5), and counsel's view on whether photos of people count as special-category data in any case. Those are open items for the maintainer.

---

## Change log

| Date | Change | By |
|---|---|---|
| 2026-11-21 | Template created (TSA-013). Worked example added. | TO SET |
