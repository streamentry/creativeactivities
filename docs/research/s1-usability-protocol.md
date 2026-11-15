# S1 usability study protocol

Status: draft, 2026-11-14. Covers [MET-029](../specs/global/17-metrics-and-evidence.md) (usability study programme) and [TSA-002](../specs/global/14-trust-safety-accessibility-privacy.md) (testing with assistive-technology users). Nothing here has been run. No session, recruitment or result exists yet. Thresholds are proposals that the maintainer must accept, in writing, before the first session.

Read with: [VISION Stage 1](../../VISION.md), [DESIGN §6](../../DESIGN.md), [senior-first validation protocol](../specs/senior-first/validation.md) (app study design, which this protocol borrows from), [AT checklist](at-testing-checklist.md), [results log](#results-template).

## 1. Goals and the Stage 1 gate

VISION Stage 1 says: run 8 to 15 usability sessions across devices, ages and accessibility needs, and fix failures before expanding content. It also sets the gate to proceed:

| Gate condition (VISION Stage 1) | What this study measures | How it is judged |
| --- | --- | --- |
| Most observed test users can find and start an appropriate activity quickly | Task 1 and Task 2 success without moderator rescue; time to start as a diagnostic | Proposed: at least two thirds of attempted sessions complete Task 1 unaided. Time to start is reported, not targeted |
| No unresolved critical safety or accessibility defect | Any finding with severity Critical (section 7) | Any open Critical finding fails the gate, whatever the average |
| Organic search impressions and query coverage begin to grow | Not in this study; see [search baseline runbook](search-baseline-runbook.md) | Separate evidence |

Secondary questions: whether a caregiver can use the hub and the finder without help; whether the printed card is usable; whether a person using assistive technology can reach the same content as anyone else. Each session also checks comprehension in five seconds (the senior-first "what is this page for?" test), recorded as a yes or no, not as a pass mark.

Not goals: speed as such, usage time, click counts, or any health outcome. We do not test cognition, do not ask for diagnoses, and do not claim the site helps with any condition.

## 2. Participant mix

Target: 12 sessions for the S1 gate, with a minimum of 8 before the gate and a re-test of at least 4 after any major navigation or game change (TSA-002). Stop recruiting at 15.

| Group | Target sessions | Why |
| --- | --- | --- |
| Caregivers of older adults, including people caring for someone with dementia | 4 | Main audience who searches and chooses for another person |
| Older adults who use the site for themselves | 3 | Several people in the audience use the site alone |
| People who use a screen reader (VoiceOver, TalkBack or NVDA) | 2 | TSA-002 |
| People who use screen magnification or 200% zoom, or large text settings; people with low vision | 2 | TSA-002 |
| People who use switch access or voice control; people with arthritis or limited dexterity | 2 | TSA-002 (may overlap with the groups above; record all that apply) |
| People with low literacy or who prefer plain, short language | 2 | VISION and TSA-008 plain-language standard |

Each person counts once in one primary group. Record every other group that applies. Do not recruit a person living with dementia as a test subject for cognition; a person with dementia may take part only through a caregiver's or their own choice, and the session must stop when they want to stop. Consent for them is covered in section 4.

Mix checks: at least four device types (iPhone, Android phone, Windows PC, one tablet) and at least two browsers. Record the device and OS version for every session.

## 3. Recruitment

Recruitment is done by the maintainer or a named partner. Claude and other agents must not send messages, post in communities or contact people.

Channels, in the order to try:

1. **Organisations that already work with the groups.** Local senior centres, memory cafés and caregiver support groups, public libraries that run older-adult classes, and vision-loss and disability user groups. Ask the organisation to share a written invitation. Do not imply endorsement by the organisation.
2. **Assistive-technology user communities** (online and local groups for screen reader, magnification and switch users). Post the invitation only where the group's rules allow it.
3. **A paid research panel** with a screener. If a panel is used, the screener questions must not ask for diagnosis, medication or health details; ask only for the group, the device and whether the person is willing to take part.
4. **Personal network of the maintainer.** Allowed for the first two or three sessions only, with a note that the participant knows the maintainer. Count them, but report the channel for every session.

Invitations must be written in plain English, state the time needed (about 45 minutes), say that the person may stop at any time, state that the site is free and that there is no sign-up, and state whether a payment or gift is offered. Payment or a gift is a maintainer decision and must be recorded in the stage report. Do not publish the invitation on the website, and do not add a sign-up form on the site for this study. Keep the contact list for scheduling only, in a separate place from the session notes, and delete it when scheduling ends.

## 4. Consent and privacy

Before any session:

- Give the consent text in plain English and read it aloud. Offer large text or a printed copy. The person chooses the format; do not hurry them.
- Consent covers: the purpose (testing the website, not the person), what is written down, whether anything is recorded, how long notes are kept, that they may stop or skip any task, and that taking part is optional and does not affect any service they use.
- Record consent as a yes or no in the session log, with the date and the moderator's initials. A signed form is optional. If a representative consents for someone else, record who and their relationship. Route this through the maintainer and the local rules; do not decide it in the session.
- Do not ask for a diagnosis, medication, care needs, cognitive test results, or any health detail. If the participant volunteers health information, do not write it down. Record only what is needed for the study: the role, the group and the assistive technology.

Recording:

- Video and audio recording are off by default. Audio recording is allowed only with a separate, explicit yes. Screen recording of the test device is allowed only with the same yes. Recordings of people's faces stay on an encrypted disk, are not uploaded to a shared drive or an AI service, and are deleted with the session notes.
- No recording on the participant's own device, and no recording of anyone who is not in the session.

Storage and deletion:

- Session notes use the template in section 8, with the participant code (P01, P02), never the name.
- Raw notes and any recordings are deleted within 90 days of the stage report (proposed; the maintainer confirms). Only the aggregate report and the anonymised findings are kept.
- The study adds no study-specific events or cookies to the site. Note that the live site loads the Google Tag Manager container on every page except Photo pairs (see TSA-018 evidence). The maintainer decides whether sessions run on the live site or on a test build with analytics off, and records which.
- A participant can ask for their notes to be deleted at any time, before the report or after. Record the request and do it within 14 days.

Child safety: no session includes a child. If a participant brings a child, end the session before the child takes part.

## 5. Tasks

Each session runs the tasks in order. Use the participant's own device and settings wherever possible. The moderator does not change settings unless the participant asks for help with them, and any such help is recorded.

| Task | Scenario read aloud | Success (independent) |
| --- | --- | --- |
| T1 Find and start an activity without help | "Imagine you have about 20 minutes, a relative who sits in a chair, and a few pens. Find something you could do together. Show me when you have started." | Reaches an activity page that fits the scenario and reads or states the first step aloud, with no hint from the moderator |
| T2 Use the activity finder | "Use the finder to find something for someone who has little energy and cannot stand for long." | Sets at least two filters that match the scenario and opens a result that fits |
| T3 Print a card | "Get a printed copy of that activity to keep on the table." | Prints or saves the card, and the printed page is readable and has the steps |
| T4 Use a hub | "Find the page of activities for someone who is in bed. Open one." | Reaches a hub, chooses an activity suited to a person in bed, and opens its page |
| T5 "We tried this" | "After you have done the activity, tell the site you tried it, if you want to." | Mark N (not built) until the feature exists. See note |

Note on T5: the "We tried this" control is a Stage 1 instrument in VISION. It is not built on the site as of 2026-11-14 (no code or copy found). Until it exists, the moderator asks the question on paper, records the answer, and marks T5 as "not built". Do not score it as a usability result.

Optional comprehension prompt (after T1): "In a few words, what is this page for?" Record the answer verbatim if the participant agrees.

Probes (use only when the participant is stuck for more than 60 seconds, or asks): "What would you try next?", "What are you looking for?", "Is there anything you expected to see?" Do not say where the control is, do not name the label, and do not explain the page.

Time to start: from the moment the home page is visible to the first meaningful interaction with an activity (a tap or a read-out of its first step). Record it in seconds with setup state (new device or used device), assistance and the device. Report as a median and range. It is a diagnostic. Do not set a target on it.

Stop rules: stop a task the moment the participant asks to stop, shows distress, or is unable to continue for two minutes after probes. Record the point where they stopped and their words.

## 6. Moderator script

Read aloud, keep close to the wording:

1. "Thank you for coming. We are testing this website, not you. There are no right or wrong answers, and if something is confusing, that tells us what to fix."
2. Consent: read the consent points in section 4 and ask: "Are you happy to take part, and to stop at any time?" Record the answer.
3. "Please think out loud if you want to. I will not help unless you ask, and I will write down what you do."
4. For each task: read the scenario, then say nothing. Watch and write down what happens, the place where the person stopped, and their exact words.
5. After the tasks: "What did you like? What was hard? Would you come back to this for yourself or someone else?" Do not lead with "Was it easy?"
6. Close: "Thank you. You can ask us to delete your notes at any time. Would you like a copy of the thank-you note?" Record the answer.

Avoid: leading questions ("Did you find the print button easy?"); explaining a control before the person has tried it; asking the person to rate usefulness on a scale; asking about memory, confusion or cognition; and any question about health, care needs or diagnosis.

## 7. Findings, severity and fixes

Each finding gets an ID (F-001, F-002, ...) and one severity:

| Severity | Meaning | Action |
| --- | --- | --- |
| Critical | A person cannot exit, cannot reach an activity or the printed card, loses data, sees a claim that could mislead about health, or an essential control has no accessible name or cannot be operated by keyboard, switch or voice | Blocks the S1 gate and any release until fixed and re-tested with at least one participant from the affected group |
| Major | A task fails or needs help, and a clear fix exists | Fix before the next stage; re-test in the next session group |
| Minor | Friction that does not stop a task | Backlog, reviewed at the stage report |

Each finding records: ID, severity, task, participants affected (codes), the observation in one sentence, the spec item it touches (for example TSA-002, WEB-012, SEO-003), and the fix or PR.

Findings update specs this way:

- Each Critical or Major finding is added to the spec item it touches, as a dated "Evidence:" or "Open:" line, in the same file as the item.
- A fixed finding is closed only after a re-test. Record the re-test date and participant code.
- MET-029 and TSA-002 get one line per stage: n, participant mix, tasks, success counts with denominators, open Critical findings, and the decision (proceed, fix, or stop).
- Do not edit `id-index.tsv` or `18-roadmap.md` from a study report. The lead updates those.

## 8. Session log and results template

Copy this block for each session. Keep the file out of git until the study is closed, and store it outside the repo if it contains any personal information. Only the aggregate stage report is committed.

```text
Session code: P__          Date: ____-__-__     Moderator: ____
Primary group: ____        Other groups: ____
Consent (yes/no): ___      Recording (none/audio/screen): ____
Device: ____  OS: ____  Browser: ____  Assistive tech and version: ____
Settings changed by participant (text size, zoom, contrast, reduced motion): ____

Task    Result (S = unaided success, H = success with help, F = fail, X = not attempted, N = not built)
T1      ____   help given (what): ____   time to start (seconds): ____
T2      ____   help given (what): ____
T3      ____   help given (what): ____
T4      ____   help given (what): ____
T5      ____   (N until built)

Comprehension (five seconds, yes/no): ____   Participant's words (only if agreed): "____"
Stopped early? (task, reason in participant's words): ____
Findings (ID, severity, task, observation): ____
Notes that are not health information: ____
Deletion requested? (yes/no, date): ____
```

Stage report (one per stage, committed as `docs/research/s1-usability-report-YYYY-MM-DD.md`):

| Item | Value |
| --- | --- |
| Sessions (n), with denominators | |
| Participant mix (by group, device, AT) | |
| Recruitment channels used (count per channel) | |
| Task success: T1 unaided / T2 unaided / T3 / T4 (count of S out of attempts) | |
| Median and range of time to start (seconds, diagnostic) | |
| Helper-assisted successes (count and type) | |
| Open Critical findings | |
| Open Major findings and fix dates | |
| Decision: proceed, fix and re-test, or stop | |
| Maintainer who accepted the thresholds, and date | |

A skipped task is not a success. A helper-assisted success is recorded separately. Report failures and withdrawals, not only passes.

## 9. Before the first session

- [ ] Maintainer accepts the proposed thresholds in section 1, with a date, in the stage report template.
- [ ] Consent text and invitation approved by the maintainer; local rules for consent on behalf of others checked.
- [ ] Payment or gift decision recorded.
- [ ] Encrypted storage set up for any recording; deletion date set.
- [ ] AT checklist ([at-testing-checklist.md](at-testing-checklist.md)) run once on the current build by the maintainer, so the first session is not the first test.
- [ ] Current build deployed to a test URL, or the live site with the date recorded.
