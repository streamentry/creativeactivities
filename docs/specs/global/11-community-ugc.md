# Community and user-generated content

This file specifies the community layer of creativeactivities.org and the app: how people say they tried an activity ("We tried this"), share a make and what changed, add an adaptation that worked for them, and rate whether an activity fitted, without a leaderboard, a follower count or a popularity feed. It also sets the moderation, safety, privacy and anti-abuse rules that must exist before any user-generated content (UGC) is public, and lists what we will not build. Items use the `COM-###` prefix.

The community layer exists to produce **proof of doing, adaptations and fit**. It is not a social network. VISION names the north-star proxy as activity starts users voluntarily confirm ("We tried this"), and MISSION says the purpose is to "get people off the app and doing something together". Every item below is judged against those two sentences.

**Read with:** [README](README.md) · [_WRITER_BRIEF](_WRITER_BRIEF.md) · [03 web features](03-features-web.md) · [04 app features](04-features-app.md) · [09 CARE](09-pillar-older-adults-dementia.md) · [10 CALM](10-pillar-creative-wellbeing.md) · [14 trust, safety, accessibility, privacy](14-trust-safety-accessibility-privacy.md) · [13 localization](13-localization.md) · [17 metrics](17-metrics-and-evidence.md) · [MISSION](../../../MISSION.md) · [VISION](../../../VISION.md) · [DESIGN](../../../DESIGN.md) · [R1 craft platforms](research/01-craft-diy-platforms.md) · [R5 search, scale and trust](research/05-search-scale-trust.md)

## 1. Principles

1. **Doing, not consuming.** Community features ask "did you make it?" and "what did you change?", never "how popular is this?".
2. **Reading and starting never need an account.** Every activity, printable and guide is readable and startable with no login (DESIGN.md §9; the free core in [16 business model](16-business-model.md)). Account-free "We tried this" is part of that promise.
3. **Pre-moderate until we know the risks.** Nothing user-written or photographed is public before a person has checked it in S2. Automated checks help; they do not decide (section 4).
4. **No popularity ranking.** Ratings measure fit ("worked as written", "needed a change", "did not suit this time"), not stars or likes. R1 §3 says "I made this" is the reusable unit and "do not make it a leaderboard" [R1 §3].
5. **Adults only as contributors.** Children do not post, are not pictured, and are not named (section 3.4; [R5 §5.1](research/05-search-scale-trust.md)).
6. **Nothing in community content can replace clinical or care advice.** Every submission and answer is screened for medical claims and crisis content (section 4, and [CALM CNT-1003](10-pillar-creative-wellbeing.md)).
7. **Credit people.** Contributors are named by a display name they choose, with a clear license (section 3.5).

**Identity model (proposal).** Reading, "We tried this" and fit reports need no account. Posting text or photos needs a display name and a verified email address (magic link, no password), used to deter spam and to allow appeals. No real name is required or shown. Care-home staff can post under an organization name only through the verified staff channel in COM-023, after the partner check in COM-022. This is an open decision (section 6).

## 2. What is in scope

- **Proof of doing.** "We tried this" tap, optional project notes, optional photos of a make.
- **Adaptations.** "What worked for us" tips, submitted variations that go to editorial review.
- **Fit.** Short fit reports and filters by fit (for example "worked seated").
- **Questions.** Moderated questions answered by editors or reviewers.
- **Partners.** Pages for groups that use activities, with permission and no endorsement.
- **Local collection.** A private list on the device, printable.

Everything else is out of scope (section 5).

## 3. Items

Priority and phase follow [README](README.md). P0 and P1 items use the item block; P2 and P3 items are in tables.

### 3.1 "We tried this" and proof of doing

### COM-001 · "We tried this" tap (no account)
Priority P0 · Phase S2 · Status new · Pillars: all
Why: the north-star proxy is voluntary confirmation of an activity start. [VISION, Metrics]; [README, Definition of #1].
What: one button on each activity page and printable card ("We tried this"). One tap; no account, no name, no comment. The event stores the activity ID, the month and a count. It is not linked to a device, IP, or user. Public display of counts is off in S1; internal use only.
Acceptance:
- Works with keyboard, screen reader and 200% zoom; the confirmation is a text message, not a color change.
- No cookie or device identifier is set for this action. Analytics payload contains the activity ID only (no feelings, no situation tags beyond the page's own facet).
- Tapping is not required to read the activity; the button has no timer and no reminder.
- Count is never shown as a rank or a "most tried" list.
Depends on: [17 metrics](17-metrics-and-evidence.md) for the definition; [TSA](14-trust-safety-accessibility-privacy.md) for consent wording.
Risks / not doing: tapping can be spammed; accept that counts are noisy and use sampled interviews as VISION says. Do not turn the count into a public score.

### COM-002 · Project note: "What we made"
Priority P1 · Phase S2 · Status new · Pillars: MAKE, CARE, GROW, CALM
Why: Ravelry-style project notes are the most reusable UGC pattern; they create proof, variation and return reasons without a ratings war. [R1 §3]
What: after tapping "We tried this", an optional form asks for: a note of up to 600 characters ("what we made, what we changed"), the date, a display name, optional adaptation tags from the activity's own list, and an optional photo (COM-003). Notes are published only after moderation (COM-009). Each note links to the activity and to nothing else.
Acceptance:
- Notes are reviewed before publication; rejected notes receive a plain reason.
- No link, phone number, email, address or school name is accepted; the text filter blocks these and the contributor is asked to remove them.
- Note text is screened for medical advice and crisis content; crisis content triggers the CALM route (CNT-1003) and an escalation (COM-010).
- A contributor can edit or delete their own note at any time (COM-029).
Depends on: COM-001, COM-009, COM-010, COM-013.
Risks / not doing: notes that look like reviews of professionals; notes that describe a person with dementia in detail (ask for "a person I care for", not a name or diagnosis).

### COM-003 · Photo of a make
Priority P1 · Phase S2 · Status new · Pillars: all (adults only)
Why: a finished or in-progress photo is the clearest proof that an activity works; adults-only rules protect people who did not choose to be photographed. [VISION, "photo of the actual process"]
What: one to three photos per note, adults only, showing the materials and the make, not people's faces by default. Photos are resized and stripped of metadata (COM-016). Each photo needs alt text (COM-018).
Acceptance:
- No photos of children, of residents in a care home, or of people in a hospital bed (COM-014, COM-015).
- Face blur is offered (COM-017) and faces are optional; a photo with an identifiable face needs the consent line in COM-015.
- Photos are pre-moderated.
- Photos are never used for training or sold (see the license in COM-019).
Depends on: COM-016, COM-017, COM-018, COM-009.

### COM-004 · "What worked for us" adaptation tips
Priority P1 · Phase S2 · Status new · Pillars: CARE, MAKE, CALM
Why: "what worked for my mum" is the adaptation people search for and the reason this library differs from a craft site; DESIGN.md §1 says the activity must fit the person. [MISSION "One idea, many adaptations"]; [R1 §6 gap 1].
What: a short tip (up to 300 characters) attached to one adaptation axis already on the activity page (for example large grip, seated, low vision, one hand, bedside, less sensory). The tip is shown under that variation as "Shared by a family" with the display name. Tips are reviewed by an editor; the editor can add a note or a correction.
Acceptance:
- A tip can only attach to an existing adaptation axis; a tip cannot create a new medical claim.
- Tips that name a condition or a diagnosis are edited to remove the diagnosis before publication, and the contributor is told why.
- Tips are shown alongside, not in place of, the reviewed adaptation.
- A tip can be marked "not suitable" by a reader (feeds COM-006).
Depends on: COM-009, COM-020, DESIGN.md adaptation fields.
Risks / not doing: tips that replace reviewed safety notes. An unreviewed tip never edits the canonical steps.

### COM-005 · Variations submitted for editorial review
Priority P1 · Phase S2 · Status new · Pillars: all
Why: "remixes" are how a community adds real value (for example a bedside version of a craft). They become canonical only by editorial decision. [R1 §3 item 3]
What: a contributor proposes a full variation (name, materials, steps, safety notes, adaptation axis). An editor and, for CARE or CALM, the relevant reviewer decide: publish as a community variation (credited), merge into the canonical activity, or decline. Accepted variations carry the contributor's display name and the review date.
Acceptance:
- No variation is published without the same safety fields as a canonical card (DESIGN.md §5).
- Credit line and license are shown (COM-019).
- The review record shows who approved and when.
- A decline is explained in one sentence and the contributor can resubmit.
Depends on: COM-021 (review queue), CNT-961 (CARE panel), CNT-1004 (CALM reviewers).

### 3.2 Fit, not popularity

### COM-006 · Fit reports (no stars)
Priority P0 · Phase S2 · Status new · Pillars: all
Why: VISION asks for "helpful / not-fit feedback" and "not a fit" reasons; R1 §3 and the rating-war risk say star ratings reward popularity, not fit. [VISION, Stage 1; R1 §7]
What: after tapping "We tried this", or on a printable card, a person can answer one question: "How did it go?" with three choices: "Easy to start", "Needed a change", "Did not suit this time". If the last or middle is chosen, optional reason chips appear ("too tiring", "too messy", "too fast", "not what they like", "needed help", "other"). No text box in S1. The chosen change may link to a variation.
Acceptance:
- No star, number, heart or like control exists.
- The answer is stored as a count per activity per month; no free text; no device link.
- Counts are not displayed publicly in S1. From S2, a result is shown only with at least 30 reports, as proportions ("most who tried it needed one change"), never as a rank.
- Staff feedback from care homes uses the same three choices (CNT-941).
Depends on: COM-001; [17 metrics].
Risks / not doing: a "not a fit" result must never be read as a failing activity by itself; small samples are misleading.

### COM-007 · Filter by fit
Priority P1 · Phase S2 · Status new · Pillars: all
Why: "Fit the moment, not the demographic" (MISSION); the finder already asks energy, sensory and seated questions. [DESIGN §3]
What: activity lists can be filtered by fit facets already in the schema (seated, one hand, low vision, bedside, less sensory, with a group, low mess) and by reported fit where the threshold in COM-006 is met. Default sort is by relevance to the chosen filters, then alphabetical. There is no sort by popularity.
Acceptance:
- Filters work without JavaScript as links; results have a text count.
- No default sort by counts.
- Every filter has a visible clear control and keyboard access.
Depends on: COM-006; [03 web features].

### COM-008 · Moderated questions with editorial answers
Priority P1 · Phase S2 · Status new · Pillars: all
Why: people ask "can I do this with a wheelchair?" and "is this safe with dementia?" Answers need an editor and a safety line; open comment threads cannot do that.
What: a "Ask about this activity" form on each activity. Questions are moderated and, if published, answered by an editor, a reviewer (CNT-961 or CNT-1004) or left with a link to the safety guide. Answers are shown on the page as "Answered by [role], [date]". Questions are not threaded; there are no public replies from other visitors.
Acceptance:
- Questions about medical treatment, medication, diagnosis, or a person's health are declined with a link to a doctor or care team.
- Crisis content triggers CNT-1003 and COM-010.
- Answers are dated and can be corrected; the correction link is visible.
- No question field collects contact details.
Depends on: COM-009, COM-021; [09 CARE](09-pillar-older-adults-dementia.md) review panel.

### 3.3 Moderation, safety and anti-abuse

### COM-009 · Moderation pipeline (pre-moderation)
Priority P0 · Phase S2 · Status new · Pillars: all
Why: no UGC goes public before a person has checked it. Pre-moderation is the rule for vulnerable audiences until S3 evidence supports something lighter. [R5 §5; senior-first trust principle]
What: every note, photo, tip, variation and question enters a queue. Automated checks run first (text filter for contact details, links and crisis words; image checks for children, faces and nudity or violence; EXIF removal). A trained moderator approves, edits minimally or declines. The moderator never makes a clinical judgement; medical-claim lines are sent to a reviewer.
Acceptance:
- Nothing is public until approved; approval is recorded with moderator role and time.
- Target turnaround for the queue is 48 hours on working days (a target, not a promise, to be set from the S2 baseline).
- Moderator guidance is written and reviewed by a safeguarding lead and a CALM or CARE reviewer.
- The queue has a clear decline reason list.
Depends on: COM-033 (moderator training), COM-016, COM-021.
Risks / not doing: automated approval of text or images in S2; outsourcing moderation without a data processing agreement.

### COM-010 · Reporting, takedown and escalation
Priority P0 · Phase S2 · Status new · Pillars: all
Why: any UGC will eventually contain something harmful; the site must remove it fast and handle children's and self-harm content with the right route.
What: a "Report" control on every note, photo, tip, variation and answer. It asks for one reason (safety, child in photo, medical claim, privacy, spam, other). Reports are reviewed before the next business day (target). Content involving children is removed immediately and handled under the applicable law, with legal review before launch. Content that discloses self-harm or distress gets the crisis route (CNT-1003) on the author's page and is escalated to the safeguarding lead.
Acceptance:
- Report control works by keyboard and screen reader; the confirmation is text.
- A reporter gets a message that the report was received; no identity of the author is disclosed to the reporter.
- Removal is logged with reason; repeat abuse triggers account restrictions (COM-012).
- Legal reporting obligations are confirmed with counsel before S2 (not legal advice here).
Depends on: COM-009, COM-011, CNT-1003.

### COM-011 · Appeals
Priority P1 · Phase S2 · Status new · Pillars: all
Why: a fair appeal is part of trust, and it corrects moderator error for adults who submitted honest notes.
What: a contributor whose content was declined or removed can ask for a second review by a different moderator, once, within 14 days. The reason is explained in plain language. Appeals about medical or safety content go to a reviewer.
Acceptance:
- One appeal per item; the outcome is recorded.
- The appeal form is text-only and accessible.
- Contributors can see the policy they are appealing against.
Depends on: COM-009, COM-020.

### COM-012 · Anti-spam, rate limits and bot control
Priority P0 · Phase S2 · Status new · Pillars: all
Why: community features attract spam and abuse; [security.md] requires rate limits on all endpoints and light controls over heavy CAPTCHA.
What: rate limits on submission endpoints; honeypot fields; a proof of email (magic link); repeat-submission checks; a short cool-down after rejection. A CAPTCHA is used only if spam volume justifies it, and never before the first activity (DESIGN.md §9).
Acceptance:
- No CAPTCHA on reading, "We tried this" or fit reports.
- Limits and thresholds are documented and tested with automated tests.
- Blocked accounts cannot re-register with the same verified email within the restriction period.
Depends on: [15 platform and data](15-platform-data-architecture.md).

### COM-017 · Optional face blur
Priority P1 · Phase S2 · Status new · Pillars: CARE, CALM, MAKE (adults only)
Why: faces are optional, and a contributor may want a family member's face hidden without giving up a photo. 
What: an on-device blur for face regions, applied before upload, with a preview and a manual brush. Blur is a convenience, not a guarantee; the consent line in COM-015 still applies.
Acceptance:
- Runs on the device, not on a server.
- Manual correction is available; a photo with no visible make is declined.
- The blur result is checked by moderators for missed faces.
Depends on: COM-016.

### COM-018 · Alt text for every photo
Priority P0 · Phase S2 · Status new · Pillars: all
Why: accessibility is core (DESIGN.md §6); screen reader users should get the make, not a blank image.
What: the upload form requires a one-sentence description of what the photo shows (for example "Hands sorting buttons into a blue tray on a kitchen table"). Moderators check that the alt text describes the photo and contains no names, children or places.
Acceptance:
- The field cannot be left empty.
- Alt text appears on the page with the photo.
- Alt text is in the submitter's language and is reviewed for language quality in S3 (see [13 localization](13-localization.md)).
Depends on: COM-003, COM-009.

### COM-033 · Moderator training and welfare
Priority P1 · Phase S2 · Status new · Pillars: all
Why: moderators will see distressing content, including material about people with dementia in crisis, grief, and possibly child-safety issues.
What: a short written training on the policy, the safeguarding route, the reviewers' roles and the medical-claim line; a rota that limits any one moderator's exposure to distressing content; access to a support service, paid for by the organization.
Acceptance:
- Training is complete before the moderator's first shift; completion is recorded.
- Moderators can pause and hand off any item without penalty.
- The welfare route is written down and tested once a year.
Depends on: COM-009, COM-010.

### 3.4 Privacy, consent and people pictured

### COM-013 · Minimal data and display names
Priority P0 · Phase S2 · Status new · Pillars: all
Why: "No sensitive health profile is required" and "collect the minimum" (MISSION non-negotiables; TSA).
What: a contributor sets a display name (not a real name; not a user ID). Stored: display name, verified email (not shown), submission content, timestamps. Not stored: precise location, device identifiers beyond what the email verification needs, health details, age, diagnosis, or other personal profile fields. Location is never requested; a place name is removed from text.
Acceptance:
- The form asks for nothing else.
- Display names are checked against a list of names that look like real identifiers of children or public figures; a warning is shown.
- Analytics events carry no content and no profile fields.
- Privacy notice is in plain language, in the launched languages only (see 13).
Depends on: COM-012, COM-029; [14 trust, safety, accessibility, privacy](14-trust-safety-accessibility-privacy.md).

### COM-014 · Children: no child images, no child contributors
Priority P0 · Phase S2 · Status new · Pillars: GROW (boundary), all
Why: COPPA (amended rule, full compliance from 22 April 2026) and the UK Age Appropriate Design Code apply to services that children may use; a public child image is the highest-risk item in this file. [R5 §5.1]
What: no contributor may post a photo or text that shows or names a child under 18. Contributors must be adults (confirmed by a checkbox, not age verification). Children's activities (GROW) are published as adult-supervised activity pages; they do not accept child-submitted content. Children are never asked for personal information.
Acceptance:
- Image checks block photos likely to show children; any such photo is removed and the uploader is asked to re-shoot without children.
- Text filter blocks names of children, schools and school phrases with children's names (list maintained by the safeguarding lead).
- No child accounts exist; no data from under-13s is collected (COPPA).
- The UK Age Appropriate Design Code checklist is completed before S2 (ICO's standards; verify the list against ICO's page).
- Legal review before launch.
Depends on: COM-009, COM-010, COM-015; [08 GROW](08-pillar-parenting-kids.md) for children's content rules.
Risks / not doing: any child-facing community space; family photo albums; "kid's make" galleries (until GROW's own review and privacy design exists).

### COM-015 · Consent for people pictured
Priority P0 · Phase S2 · Status new · Pillars: CARE, CALM, all
Why: the most vulnerable people in this pillar may be photographed without choice. MISSION requires consent; DESIGN requires respectful depiction.
What: a required checkbox: "I confirm that every person in this photo is an adult who agreed to be photographed, or that I have the permission of their family or carer for a person who cannot agree." A photo of a person in a care home, hospital bed or day center needs written consent from the setting; the contributor confirms it. Any person who asks for a photo to be removed gets it removed without a reason needed.
Acceptance:
- The checkbox is required for any photo with a person in it.
- Care-home and hospital photos are declined unless the setting's written consent is confirmed by the moderator.
- Removal requests are actioned within the reporting target in COM-010.
- No photo of a person with dementia is published without the consent line and moderator check; the page never names the person.
Depends on: COM-003, COM-009, COM-010, [CARE CNT-932](09-pillar-older-adults-dementia.md) (care-home rules).

### COM-016 · Image processing: EXIF stripped, resized, stored safely
Priority P0 · Phase S2 · Status new · Pillars: all
Why: photos carry location and device data; large files slow the site (performance budget in DESIGN §7).
What: on upload, remove all metadata (EXIF, GPS, device, timestamps), resize to the site's widths, convert to WebP or AVIF with a JPEG fallback, and store originals privately for moderation only, with a fixed retention period.
Acceptance:
- Published images have no metadata; checked by an automated test on a sample set.
- Originals are not public and are deleted at the retention end (target 90 days, to confirm with [15 platform](15-platform-data-architecture.md)).
- File types are restricted (JPEG, PNG, HEIC converted server-side); size limits are shown before upload.
- Images have explicit width and height in the published HTML.
Depends on: [15 platform](15-platform-data-architecture.md).

### COM-029 · Edit, delete and export my contributions
Priority P0 · Phase S2 · Status new · Pillars: all
Why: contributors must be able to take back what they gave; this is the deletion control that personal data requires.
What: a contributor can edit or delete a note, tip, photo, variation or question from a link sent to their verified email. A data export of their own contributions is provided on request, as a file they can keep.
Acceptance:
- Deletion removes the public item within the reporting target and deletes stored originals per the retention rule.
- Export is a plain file; no other person's data is included.
- The link expires after use or 30 days.
- Deletion is confirmed by email in plain language.
Depends on: COM-013; [14 trust, safety, accessibility, privacy](14-trust-safety-accessibility-privacy.md).

### COM-030 · Accessible community features
Priority P0 · Phase S2 · Status new · Pillars: all
Why: community features are where accessibility most often fails (forms, errors, images); DESIGN §6 requires testing with assistive technology users.
What: all community forms and displays meet WCAG 2.2 AA; plain language; error messages say what to fix; works at 200% zoom and 320 CSS px; keyboard and screen reader tested; no timers on forms; large touch targets; reduced motion respected.
Acceptance:
- Automated scans plus manual testing with at least three assistive-technology users before launch.
- Forms save progress locally before submission (an unsent draft stays on the device).
- No CAPTCHA that blocks assistive technology.
Depends on: [14 trust, safety, accessibility, privacy](14-trust-safety-accessibility-privacy.md).

### 3.5 Credit, license and rules

### COM-019 · Contributor credit and license
Priority P0 · Phase S2 · Status new · Pillars: all
Why: credit and clear rights are part of "Provenance" (MISSION); license terms cannot be added later without consent.
What: each published contribution is credited to the display name and date. Contributors grant the site a license to publish, translate, crop and display their contribution, with credit. The license scope is written in plain language and states that the site does not sell contributions or use them to train AI systems without a separate, explicit opt-in. The exact open or site license is a decision (section 6).
Acceptance:
- The license and credit text is shown before the first submission and must be accepted.
- A contributor can withdraw content (COM-029).
- Translations of contributions are labelled as translated, with credit to the original author.
- No content from other sites or books is accepted (copyright check at moderation).
Depends on: COM-020; legal review.

### COM-020 · Contributor guidelines and claim rules
Priority P0 · Phase S2 · Status new · Pillars: all
Why: the same wording rules apply to contributors as to the site (CALM CNT-1001; CARE section 2).
What: a short page of guidelines: what is welcome, what is not (claims of treatment or cure, diagnosis, photos of people without consent, child images, contact details, advertising), a worked example of good and bad notes, and the reporting route. Contributors see it before the first submission.
Acceptance:
- Guidelines pass the wording lint used for the site (CALM CNT-1000).
- The page is readable at a Flesch-Kincaid grade of about 8 or lower (target, checked on the final copy).
- Translated only when a reviewed translation exists (13).
Depends on: CNT-1000, CNT-1001.

### COM-021 · Editorial review queue and roles
Priority P1 · Phase S2 · Status new · Pillars: all
Why: variations and answers need an editor; moderators decide safety, editors decide content quality.
What: a single queue for variations (COM-005), answers (COM-008) and tips (COM-004), with roles: moderator (safety and rules), editor (content and style), reviewer (CARE or CALM claims, by panel). Each item shows its status and the reason for any change.
Acceptance:
- Roles are defined, with permissions tested.
- Each decision is recorded with role and date.
- Queue targets are set from the S2 baseline.
Depends on: COM-009, CNT-961, CNT-1004.

### COM-031 · "Suggest a correction" on every activity
Priority P0 · Phase S2 · Status new · Pillars: all
Why: DESIGN §4B requires a correction link; trust depends on readers being able to fix errors without an account.
What: each activity, guide and printable card has a "Suggest a correction" link to a short form (what is wrong, where, optional email for a reply). It goes to the editorial inbox, is not public, and no account is needed.
Acceptance:
- Works without JavaScript (a plain form or a mail link with a template).
- The form does not store IP address or device identifiers beyond what the email system needs.
- Corrections are logged, with the date of the fix shown on the page when a material change is made.
Depends on: [03 web features](03-features-web.md).

### 3.6 Partners and later items

These items are P2 or P3. They stay out of S1 and S2 until their evidence gates pass.

| ID | Feature | Pillar | Priority | Phase | Status | Summary and conditions |
|---|---|---|---|---|---|---|
| COM-022 | Partner organization pages ("Groups that use this") | CARE, GROW, TOGETHER | P2 | S3 | new | Pages for care homes, libraries, schools and family groups that use activities, only with written permission and logo use agreed. No endorsement by a professional body without its written permission. No paid placement. Partner pages list what the group does, not what it claims about outcomes (R5 §4). |
| COM-023 | Care-home coordinator feedback channel | CARE | P2 | S3 | new | The fit-report choices (COM-006) plus a "what worked for this group" tip, for staff of a verified organization. Staff identity is checked against the organization, not by personal data. Feeds CNT-941. |
| COM-024 | My made list (private, on the device) | all | P2 | S2 | new | Local list of activities a person has tried, with notes, exportable as a printable list. Nothing leaves the device. No streak, no count goal. |
| COM-025 | "Made together" printable card with credit | all | P2 | S2 | new | A card a person can print with the activity name, the date and the display name of the contributor, if they chose to credit. No QR to a profile. |
| COM-026 | Curated story page (with permission) | CARE, CALM, TOGETHER | P2 | S3 | new | Editor-selected short stories from families, with written permission and no identifying detail. No comments. Stories are not a feed. |
| COM-027 | Volunteer translation and review contributions | all | P2 | S3 | new | Volunteers translate or review activity text under the translation workflow in [13 localization](13-localization.md). Credited, with a reviewed-by line. Machine text is never published without human review (R5 §2.3). |
| COM-028 | Email digest of new activities (opt-in) | all | P2 | S2 | new | Monthly, opt-in, one email with a few new activities, by situation not by age or diagnosis. One-click unsubscribe. No streaks, no urgency. No notification pressure. Owned with [12 distribution](12-search-geo-distribution.md). |
| COM-032 | Share a made card with someone at a distance | all | P3 | S3 | new | A printable or link card the person can send to a family member. The link carries no personal data and no account is needed. Only after usability tests show it helps remote families (see [CARE CNT-935](09-pillar-older-adults-dementia.md)). |

### COM-034 · Community quality metrics
Priority P1 · Phase S2 · Status new · Pillars: all
Why: the community layer must be measured against the purpose, not its size.
What: the metrics are: "We tried this" starts per activity (count only), share of notes that reach a "worked" fit answer, time to moderation decision, decline and appeal rates by reason, report rate per 1,000 views, share of reports resolved in target, and the number of activities with a reviewed variation. No engagement-time metric. Defined in [17 metrics](17-metrics-and-evidence.md).
Acceptance:
- Metrics are published to the team monthly, with no individual contributor data.
- A metric that rewards volume of posts is removed.
- Safety incidents are reported separately with the route taken.
Depends on: COM-001, COM-006, COM-009, COM-010.

## 4. Moderation rules in one place

- **Pre-moderate everything** in S2: text, photos, tips, variations and questions.
- **Automated checks** flag, never approve. They look for contact details, links, child images, faces, EXIF, crisis words, medical claim words ("cures", "treats", "reverses") and copied text.
- **Medical and treatment claims** are declined or sent to a reviewer. Moderators do not judge whether a treatment works.
- **Crisis and self-harm content** gets the CALM route (CNT-1003) on the author's page, and goes to the safeguarding lead the same day.
- **Child images** are removed immediately; the legal route is set with counsel before launch.
- **Repeat abuse** leads to a restriction, not a silent ban; appeals are open (COM-011).
- **Every decision** is recorded with role, date and reason.

## 5. What we will not build

These are not on the roadmap for any phase. A change to this list needs a maintainer decision and a fresh review against MISSION.

1. Public profiles of people who are vulnerable, including any profile of a person living with dementia or a child.
2. Follower counts, following lists or any social graph.
3. Likes, hearts, stars or any popularity score that sorts or ranks activities or contributors.
4. Leaderboards, badges for volume, or "top makers".
5. Streaks, daily goals or reminders that shame a person for not posting or tapping.
6. Direct messages between users, in any phase, and any direct message with a child.
7. Open comment threads or a public feed of activity by default.
8. Ads, sponsored notes, affiliate links or paid placements inside community content (DESIGN §9).
9. Sale, licensing or AI training use of contributions without a separate, explicit opt-in.
10. Incentives for ratings or reviews, and reviews written by or for paid providers.
11. Community spaces for children, family photo albums or "kid's make" galleries until GROW's privacy and review work is complete.
12. A "clinically reviewed" or "therapist approved" badge for user content.
13. Location-based matching or public maps of who is near whom.

## 6. Open questions

- **Identity model.** Is a verified email required to post, or can S2 launch with a moderated, email-free note that is never public until approved? The proposal above needs legal and PLAT review.
- **License.** Which license applies to contributions (a site license with credit, or an open license such as CC BY)? The choice affects translation, reuse by partners and AI training. A decision is needed before COM-002.
- **Moderation capacity.** Who moderates, in which languages, and at what volume? Pre-moderation at S2 volumes needs a staffing plan and a budget line in [16 business model](16-business-model.md).
- **Legal route for child content.** Which counsel reviews COM-014 and COM-010 for each launch country?
- **Partner endorsements.** How will a care home or library confirm written permission for its name and logo (COM-022)?
- **Crisis route coverage.** COM-010 and COM-008 depend on CNT-1003, which is verified for UK, Ireland and US only.
- **Retention.** The 90-day retention for originals (COM-016) and the 30-day link expiry (COM-029) are targets to confirm with the [platform spec](15-platform-data-architecture.md).
