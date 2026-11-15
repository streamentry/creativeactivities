# Privacy and security breach response plan (DRAFT)

Item: [TSA-046](../specs/global/14-trust-safety-accessibility-privacy.md) (privacy and security breach process).

**Status: DRAFT for maintainer and counsel sign-off. Not approved.** The owners and contacts below are placeholders. The tabletop exercise has not been run. The notification templates have not been reviewed by counsel and must not be sent. Nothing here is a public promise of any timeline.

The legal points below are general knowledge, not advice. Counsel must verify each one before this plan is relied on.

---

## 1. What could go wrong here

We hold little personal data (see [retention and data requests](retention-and-data-requests.md)). The realistic incidents are:

- Unauthorized access to the support mailbox, which holds requests and safety reports.
- Unauthorized access to the analytics account, the hosting account (Cloudflare), the git host, or an app store developer account.
- A secret in the repository or in a build, such as an API key or the app's signing material (see the secret scan in `site/src/lib/secrets.test.ts`).
- A website change that exposes reader data, such as a script that sends more than the inventory lists ([data-inventory.md](../specs/global/data-inventory.md)).
- Loss of the signing keys for the app.

## 2. Owners and contacts

| Role | Who | Contact |
|---|---|---|
| Incident lead (decides, keeps the log) | **TO SET** | **TO SET** |
| Technical lead (contains and investigates) | **TO SET** | **TO SET** |
| Communications (approved wording only) | **TO SET** | **TO SET** |
| Counsel (notification decisions) | **TO SET** | **TO SET** |
| Hosting, email and store account owners | **TO SET** | **TO SET** |

Keep the contact list outside the repository.

## 3. Steps

1. **Detect.** Anyone who notices a possible incident emails the support address with the subject "security incident". Account alerts from the hosting, email, analytics and store accounts go to the incident lead too.
2. **Start the log.** Record the time the incident was first known. Every later step gets a time.
3. **Contain.** Revoke or rotate the exposed secret or password, remove the bad change, and turn off the affected account's access. For a secret in git, rotate it first, then clean the history.
4. **Assess.** Decide what data was involved, whose, how many people, and whether it could cause harm. Check the analytics events list and the on-device inventory first.
5. **Decide on notification.** Counsel decides, with the incident lead. The points to check are:
   - **EU GDPR:** report a personal data breach to the supervisory authority without undue delay and, where feasible, within 72 hours of becoming aware, unless it is unlikely to result in a risk to people. Tell affected people without undue delay where it is likely to result in a high risk. *(Verify with counsel.)*
   - **US state laws** and any other country where we have readers: counsel lists them and their deadlines. *(Verify with counsel.)*
6. **Notify, if decided.** Use only templates counsel has approved (section 5).
7. **Recover and review.** Restore the service, check that the fix worked, and write what happened, what was done and what changes.
8. **Close.** Record the close date in the log.

## 4. Incident log

| Field | Notes |
|---|---|
| Reference | `INC-YYYY-NNN` |
| First known (date and time) | |
| Reported by | |
| What happened | |
| Data involved, and whose | |
| Containment steps and times | |
| Decision on notification, by whom, and why | |
| Notifications sent (who, when, which template) | |
| Root cause and fix | |
| Closed (date) | |

## 5. Notification templates (not reviewed by counsel, do not send)

**To the supervisory authority or regulator:** [describe the breach, the data, the number of people, the likely effects, the steps taken, and a contact point]

**To people affected:** [what happened, in plain words, what data it was, what we have done, what they can do, and how to ask questions]

Counsel must approve each template, and any timeline wording, before use.

## 6. Tests and evidence

- **Tabletop exercise:** **not yet run.** TSA-046 requires one before the S1 gate. Record the date, the scenario, the people present and the gaps found here.
- **Secret scan:** runs in the test suite (`site/src/lib/secrets.test.ts`).
- **Dependency audit:** the results are in [security-scans.md](../specs/global/security-scans.md).

## 7. Open items

1. Name every owner and contact (section 2).
2. Run the tabletop exercise and record it.
3. Counsel review of section 3, step 5, and of the templates in section 5.
4. Decide where the incident log is kept, outside the repository.
