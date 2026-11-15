# Legal review to-do

**Owner:** the maintainer, with counsel. **Added:** 2026-11-15. **Status:** waiting for a meeting with a lawyer.

The drafts below are not approved. Until counsel signs them off, do not publish any period, deadline or wording from them, and do not send any template. Tick a box only when counsel has answered, and write the answer (or a link to it) next to the item.

## Before the meeting (maintainer)

- [ ] Fill in the names and contacts in `docs/legal/breach-response-plan.md` §2 (incident lead, technical lead, communications, counsel, account owners).
- [ ] Name the owner of data requests in `docs/legal/retention-and-data-requests.md`.
- [ ] Note where you are based and where most visitors come from (GA4 › Reports › Demographics), so counsel can say which laws apply.
- [ ] Do the GA4 and Tag Manager console steps in `docs/specs/global/analytics-consent.md` (they change what data exists, which affects several answers below).

## Data retention and data requests (`docs/legal/retention-and-data-requests.md`)

- [ ] **Retention periods.** How long to keep each item. All are still "TO SET":
  - [ ] Emails to the support address (requests, corrections, safety reports, feedback).
  - [ ] Google Analytics 4 event data (proposed: 2 months, the shortest standard GA4 setting).
  - [ ] Error logs and hosting logs, if any.
  - [ ] Backups.
- [ ] **Deadlines for answering requests.** The draft assumes one month (EU and UK GDPR). Which US state privacy laws apply, and what are their deadlines?
- [ ] **Requests from or about children.** How to check that the person asking is the parent or guardian, and what COPPA and the UK Children's Code require.
- [ ] **Legal exceptions.** When may a request to delete or access data be refused?
- [ ] **Reply wording.** Approve the templates for acknowledging, answering and refusing a request.
- [ ] **Analytics requests.** Whether "we use Google's deletion tools" is an adequate answer to a request that involves GA4 data.

## Breach response (`docs/legal/breach-response-plan.md`)

- [ ] **When to report.** Confirm the GDPR 72-hour notice to the supervisory authority, and the threshold for telling affected people.
- [ ] **Which supervisory authority** is ours (EU lead authority, UK ICO, or both).
- [ ] **US state breach laws.** Which apply, their deadlines and who must be told.
- [ ] **Notification templates** in §5: review and approve each one, including any timeline wording.
- [ ] **Step 5 (decide on notification):** approve the decision steps.
- [ ] **Tabletop exercise:** run the plan once with a made-up incident, after the owners are named, and record what went wrong.

## Also for the same meeting

- [ ] **Which countries' laws apply** to the website and the app.
- [ ] **Health-related data (GDPR Article 9).** The site never asks for a diagnosis, but caregiving, dementia and calm pages could suggest one. Is page-level analytics on those pages health data? Should they skip analytics even after a yes (spec TSA-013, TSA-018)?
- [ ] **The consent bar** (`site/src/components/ConsentBar.astro`, live since 2026-11-15). Is the wording and design enough under UK PECR and the EU ePrivacy rules, and in US states that require consent? Is English-only text acceptable on translated pages until translations exist?
- [ ] **The privacy notice** (`/privacy/`). Review it as a whole after the consent change.
- [ ] **App store claims** (`docs/legal/app-review-gates.md`): intended use with dementia and Alzheimer's in app metadata, words to avoid, the age rating and regional obligations, and whether to keep Apple's standard EULA.

## After the meeting

- [ ] Put counsel's answers into the two drafts and remove "DRAFT" from their status lines.
- [ ] Update the privacy notice where the answers change it.
- [ ] Mark TSA-011, TSA-013 and TSA-014 in `docs/specs/global/14-trust-safety-accessibility-privacy.md` with the outcome.
