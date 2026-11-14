# 14. Trust, safety, accessibility and privacy (TSA-###)

This file sets the requirements that make the website and app safe to rely on: accessibility, privacy and data, children, content safety labels, the claims policy, editorial review and corrections, user content and image rights, security, incident response and transparency. It extends [MISSION](../../../MISSION.md), [VISION](../../../VISION.md), [DESIGN](../../../DESIGN.md) and the trust sections of [research 05](research/05-search-scale-trust.md). It is a product requirement summary, not legal advice. Each item named as a legal duty needs a check by counsel before launch. The research notes flag which legal points are unverified.

**Read with:** [README](README.md) · [search, GEO and distribution](12-search-geo-distribution.md) · [localization](13-localization.md) · [community and UGC](11-community-ugc.md) · [platform and data](15-platform-data-architecture.md) · [metrics](17-metrics-and-evidence.md) · [business model](16-business-model.md) · [GROW](08-pillar-parenting-kids.md) · [CARE](09-pillar-older-adults-dementia.md) · [CALM](10-pillar-creative-wellbeing.md) · [app features](04-features-app.md) · [R3 art therapy and wellbeing](research/03-art-therapy-wellbeing.md) · [R4 games](research/04-games-engagement.md)

## Starting point (baseline, 2026-11-14)

- Accessibility: the design system targets WCAG 2.2 AA. Axe checks run on key pages. Print styles, RTL and reduced motion exist ([README baseline](README.md)).
- No accounts for the core product. The app works offline with no account. Family photos stay on the device. The web photo game uses local photos and never uploads them ([README baseline](README.md)).
- Pages exist for the editorial policy, the safety and medical disclaimer, the FAQ and organizations. No accessibility statement, corrections page or public privacy notice is listed in the baseline. Confirm.
- Analytics: the web SEO strategy refers to GA4, while DESIGN forbids third-party trackers. The live state is unknown (TSA-011).
- Security headers: `site/public/_headers` exists. Its contents have not been checked against the target below.

---

## A. Accessibility

### TSA-001 · WCAG 2.2 AA as the release gate
Priority P0 · Phase S1 · Status partial · Pillars: all

Why: Accessibility is a core promise, and older users, people with low vision and people with motor limits are the primary audience [MISSION, "Accessible by default"; DESIGN §6]. WCAG 2.2 is the current W3C recommendation, and its 9 added criteria include several that matter here [R5 §5.4].

What: Every template and game passes an automated scan and a manual checklist before release. The manual list must include the criteria the automated scan misses, including 2.4.11 (focus not obscured), 2.5.8 (target size, minimum 24px, with 48px as the product standard), 2.5.7 (dragging needs a non-drag alternative), 3.3.7 (redundant entry), 3.2.6 (consistent help) and 1.4.10 (reflow).

Acceptance:
- Release checklist recorded per release.
- Zero critical or serious automated violations on any template.
- Manual checks for the listed criteria completed on each new template and game.

Depends on: TSA-002, TSA-011 (no third-party elements that break focus).
Risks / not doing: Do not describe a page as "accessible" based on a scan alone [DESIGN §6].

### TSA-002 · Testing with assistive-technology users
Priority P0 · Phase S1 · Status new · Pillars: all

Why: Automated checks are necessary and insufficient [DESIGN §6]. VISION sets 8 to 15 usability sessions across devices, ages and accessibility needs before expansion [VISION, Stage 1].

What: Recruit users of screen readers, switch access, voice control, screen magnification and text-size settings, plus people with arthritis and low vision [R5 §5.4]. Each Tier 1 flow is tested in its real setting with a real device. Findings are logged by severity, and any critical finding blocks the release.

Acceptance:
- At least 8 sessions before the S1 gate, and again after any major change to navigation or a game.
- Each session records task, completion, time to start an activity, and any help needed.
- A critical finding blocks release until fixed and retested.

Depends on: [roadmap](18-roadmap.md) S1 gate.
Risks / not doing: Do not count a tester's answer to a survey as a usability test.

### TSA-003 · Zoom, reflow, motion and timing
Priority P0 · Phase S2 · Status partial · Pillars: all

Why: Older users and people with low vision often use large text. Timed challenges exclude people who need more time [DESIGN §6].

What: Content works at 200% text size and at 320px width without horizontal scrolling. Reduced-motion settings are honored everywhere. No game is timed by default. Where a timer exists, the user can turn it off or extend it (WCAG 2.2.1). The app's picture matching has no timer or score (baseline).

Acceptance:
- Automated and manual tests at 320px and 200% for each template.
- Reduced motion tested on each platform.
- Every timed element has a control to extend or turn off.

Depends on: TSA-001.
Risks / not doing: Do not add a score or streak to make a game feel finished [R4 §7].

### TSA-004 · Keyboard, focus and drag alternatives
Priority P0 · Phase S2 · Status partial · Pillars: all

Why: Keyboard and switch users can only use what they can reach and see. The sorting, puzzle and picture-matching games need drag-free paths [DESIGN §6; R4 §5].

What: Every interactive element is reachable and operable with a keyboard and a switch. Focus is always visible. Every drag interaction (sort together, picture puzzle) has a tap or key alternative that does the same job.

Acceptance:
- Keyboard-only pass on every game and every template.
- Each drag action has a documented alternative, tested.
- Focus indicator passes contrast on all backgrounds.

Depends on: TSA-001.
Risks / not doing: Do not hide a control behind hover.

### TSA-005 · Color, contrast and text alternatives
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Instructions must not depend on color. Instructional images need text alternatives [DESIGN §6; SEO.md §5.2].

What: Color is never the only cue. Palette tokens are checked for text and non-text contrast. Every instructional image has a text alternative, and every essential video has captions and a transcript.

Acceptance:
- Contrast report for every token pair in use.
- Alt text reviewed for every instructional image.
- No video is essential without a transcript on the page.

Depends on: [DESIGN §2](../../../DESIGN.md) palette validation.
Risks / not doing: Do not write alt text that repeats the keywords.

### TSA-006 · Flashing and motion in games
Priority P1 · Phase S2 · Status new · Pillars: PLAY

Why: Flashing content can trigger seizures, and the games use motion [R4 §5].

What: No content flashes more than three times in any second (WCAG 2.3.1). Motion in games has a reduced-motion version. Motion is used to show cause and effect, not decoration.

Acceptance:
- Flash check on each game and animation.
- Reduced-motion version tested.

Depends on: TSA-003.
Risks / not doing: Do not add motion to make a game "feel alive" at the cost of calm.

### TSA-007 · Accessibility statement and feedback route
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Users need a way to report barriers, and the European Accessibility Act sets duties for some services from 28 June 2025 [R5 §5.4]. The free site is probably outside the core scope, but the statement is cheap and builds trust.

What: A page at the accessibility address (one of the transparency pages in TSA-048) states the conformance level tested, the known gaps, how to report a barrier and a response target. Feedback goes to a monitored address.

Acceptance:
- Statement lists tested pages and tools, and dated known issues.
- Feedback route works and is tested.
- The response target is a proposal set by the maintainer, and the page says so.

Depends on: TSA-002.
Risks / not doing: Do not claim full conformance without a test record.

### TSA-008 · Plain-language standard
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Short language is easier for everyone, and it matters most for stressed caregivers and people who prefer short text [DESIGN §6].

What: One action per step. Short sentences. Common words first. Plain-language check on every activity and hub by an editor, using a readability tool as a prompt, not a score target.

Acceptance:
- Each activity's steps pass the editor's checklist.
- No step contains two actions joined by "and then" without a break.

Depends on: [content library](06-content-library.md) editorial process.
Risks / not doing: Do not simplify so far that a safety instruction loses meaning.

### TSA-009 · Accessibility regression tests in CI
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Accessibility regresses silently when templates change.

What: Automated accessibility tests run on every template and game on each change. The test list is the one in TSA-001.

Acceptance:
- CI fails on new critical violations.
- Test coverage recorded per template.

Depends on: TSA-001.
Risks / not doing: Do not disable a failing rule to pass CI.

---

## B. Privacy and data

### TSA-010 · No accounts for the core product
Priority P0 · Phase S2 · Status partial · Pillars: all

Why: The free core must not depend on an account, and vulnerable users should not have to hand over identity to use an activity [MISSION, "Free core value"; web SEO brief].

What: Reading, printing, playing games and using the finder require no login, no email and no payment. Saved activities stay in the browser or on the device.

Acceptance:
- Test on every core flow with no account.
- No account wall before the first activity.

Depends on: [business model](16-business-model.md).
Risks / not doing: Do not add an account to enable sharing without a separate decision and a free path.

### TSA-011 · Data and tracker inventory
Priority P0 · Phase S2 · Status new · Pillars: all

Why: Nobody can promise minimal data without a list. The web SEO strategy refers to GA4, while DESIGN §7 forbids third-party trackers, so the live state is unknown.

What: One inventory of every script, cookie, local storage key, pixel, SDK and event in the website and the app. Each item records purpose, data sent, recipient and retention.

Acceptance:
- Inventory signed off by the maintainer.
- Any item not in the inventory fails the release check.
- No third-party tracker on child-reachable or health-related pages.

Depends on: TSA-012, [platform](15-platform-data-architecture.md).
Risks / not doing: Do not add a tool "to see" data before the inventory exists.

### TSA-012 · Event allowlist and no health data
Priority P0 · Phase S1 · Status new · Pillars: all

Why: Health details in analytics are a serious privacy and legal risk [R5 §5.2]. The product must not infer a condition [MISSION].

What: Analytics sends only the events in the allowlist: `activity_view`, `activity_print`, `activity_save`, `activity_share`, `activity_started_confirmed` (opt-in, self-report), `activity_not_a_fit` (reason category, no free text) and `app_cta_click` [SEO.md §11.1]. No diagnosis, participant name, child identity or free text is ever sent. Page URLs are reduced to page type and activity ID before they leave the site.

Acceptance:
- Event payload test: schema check rejects any extra field.
- Free-text fields do not exist in any event.
- Reason categories are a fixed list reviewed for stigma.

Depends on: TSA-011.
Risks / not doing: Do not use a pixel that records full URLs.

### TSA-013 · Special-category data posture (GDPR Article 9)
Priority P0 · Phase S2 · Status new · Pillars: CARE, CALM, GROW

Why: Information about a person's health is special-category data under GDPR Article 9(1). A dementia diagnosis or care need recorded about someone is health data [R5 §5.2].

What: The core product collects no health information. No feature asks for a diagnosis, stage, medication or care level. Any future feature that might collect health data needs a data protection impact assessment and counsel's review before design starts.

Acceptance:
- Written rule in the privacy notice.
- A DPIA template exists and is used for any feature that touches health or children.
- Counsel check recorded (R5 flags this point as "verify with counsel").

Depends on: TSA-011, [README](README.md) open questions.
Risks / not doing: Do not use "age" as a proxy for condition.

### TSA-014 · Consent for non-essential storage
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Where consent is needed, the choice must be as easy as accepting, and must not nudge. The most privacy-preserving option is the default (the user's global privacy rule).

What: If the inventory has no non-essential cookies or storage, there is no banner. If it does, consent is required before the item loads, with reject as prominent as accept, and no pre-ticked boxes. Counsel confirms the rules for each market.

Acceptance:
- Consent test in each launched market.
- No consent prompt before the first activity.

Depends on: TSA-011.
Risks / not doing: Do not add a banner that exists only to look compliant.

### TSA-015 · Photos stay on the device
Priority P0 · Phase S2 · Status partial · Pillars: all

Why: Family photos are sensitive, and the product's promise is that they never leave the device unless the person chooses [app baseline; plan README].

What: The app copies only chosen photos, stored on the device. The web photo pairs game uses local photos and never uploads them. Permission text says so and says the library is not scanned [native review, Tier 1].

Acceptance:
- Network trace on each platform shows no upload of photos.
- Permission text in each launched language matches the behavior, reviewed by the reviewer.
- Photos can be removed from the app and from the device.

Depends on: [app features](04-features-app.md).
Risks / not doing: Do not add cloud sync for photos without a separate privacy review and an explicit opt-in.

### TSA-016 · Retention, deletion and data requests
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Where personal data exists, people need controls [MISSION, "Privacy"].

What: A retention schedule per data type (email list, community content, support messages, any analytics). A deletion route for each. A process for access and erasure requests under GDPR and state or national laws, for data the organization holds.

Acceptance:
- Schedule published in the privacy notice.
- Deletion tested end to end for each store of personal data.
- Request process has an owner and a log.

Depends on: TSA-011.
Risks / not doing: Do not keep email lists longer than the schedule.

### TSA-017 · Privacy notice and store privacy labels
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Store privacy labels and the site notice must match each other and the inventory. A mismatch is a trust failure and a store risk.

What: A plain-language privacy notice in each launched language (see [localization](13-localization.md)). The Apple privacy label and the Google Play data safety form are filled from the inventory, not from memory.

Acceptance:
- Notice and both store declarations reviewed against TSA-011 on each release.
- Notice in each reviewed language, with the reviewer's sign-off.

Depends on: TSA-011, [L10N-003](13-localization.md).
Risks / not doing: Do not describe a privacy feature that does not exist.

---

## C. Children

### TSA-018 · Child-reachable default
Priority P0 · Phase S1 · Status new · Pillars: GROW, all

Why: Children can reach a public free site, and parents share activities with children. COPPA's amended rule was fully enforceable by 22 April 2026 [R5 §5.1]. An FTC statement dated 25 February 2026 narrows enforcement for age-verification data only. It is not a safe harbor [R5 §5.1].

What: Treat every page as one a child may use. No child accounts. No collection of personal information from anyone under 13 (or under the applicable age in each market). No persistent identifiers from children.

Acceptance:
- No account or form asks for an age, date of birth or school.
- Analytics contains no identifiers that could be linked to a child.
- Counsel review recorded for each launched market.

Depends on: TSA-011.
Risks / not doing: Do not use an age gate as a substitute for design.

### TSA-019 · No ads or ad technology on child-reachable pages
Priority P0 · Phase S2 · Status new · Pillars: all

Why: COPPA requires separate verifiable parental consent before disclosing children's data to third parties, including for targeted advertising [R5 §5.1]. Ads inside activities and games are rejected by product rule [MISSION; R4 §7]. Ad-led feeds on craft platforms drift toward paid placement and trust loss [R1 §7].

What: No advertising, ad network, retargeting pixel or ad SDK on any page or screen a child can reach. Sponsorships are not placed in activities.

Acceptance:
- Inventory check (TSA-011) shows no ad technology.
- Ad-free check on every release.

Depends on: TSA-011, [business model](16-business-model.md).
Risks / not doing: Do not accept a "contextual" ad as an exception.

### TSA-020 · UK Age Appropriate Design Code assessment
Priority P0 · Phase S2 · Status new · Pillars: all

Why: The Children's Code is statutory under the Data Protection Act 2018 and applies to online services likely to be accessed by under-18s [R5 §5.1]. It sets high-privacy defaults and bars nudges that push users to share more data [R4 §7].

What: Before each launch, a written assessment against the 15 standards, with the high-privacy default, data minimization and nudge standards first. The numbering used in the research differs by source: R4 cites standard 7 for default settings and 13 for nudges. Verify against the ICO's page before citing numbers in public.

Acceptance:
- Assessment on file per launch.
- Default privacy settings are the highest setting.
- No nudge screen asks for more data.

Depends on: TSA-011, TSA-013.
Risks / not doing: Do not cite the standard numbers in public copy until verified.

### TSA-021 · Children in media
Priority P0 · Phase S2 · Status new · Pillars: GROW, all

Why: Public images of children need an explicit parental release, and video labels have legal effect on YouTube [R5 §4, §5.1].

What: No public child image, name or identifying detail. Any child who appears in a photo or video has a signed release from a parent or guardian. Kids-focused videos carry the correct made-for-kids label.

Acceptance:
- Release log for each child image or video, kept with the asset (TSA-038).
- Label check on each YouTube upload.

Depends on: TSA-038.
Risks / not doing: Do not use a stock child photo as a demonstration of a real activity.

### TSA-022 · Parenting content boundaries
Priority P1 · Phase S2 · Status new · Pillars: GROW

Why: Developmental over-promise and screen-time framing are the common failures in parenting content [R2 §7].

What: No claim that an activity builds a named skill unless evidence is cited. Use "playful practice of" language. Screen-time framing follows the mission: the activity is the goal, not the screen.

Acceptance:
- Claims policy (TSA-028) applied to parenting pages.
- No autoplay or endless feed on parenting content.

Depends on: TSA-028, [GROW](08-pillar-parenting-kids.md).
Risks / not doing: Do not cite WHO or AAP limits as a product feature.

---

## D. Content safety labels

### TSA-023 · Standard safety vocabulary and fields
Priority P0 · Phase S2 · Status partial · Pillars: all

Why: Printed or app activities with small parts and no supervision line are a real harm [R2 §7]. The data model already has `safety_flags` and `supervision` fields [DESIGN §5].

What: A fixed vocabulary for safety flags, mapped to each locale: small parts and choking; hot surfaces and heat; sharp tools (scissors, craft knives); adhesives and skin contact (patch-test note); food used as material (allergens, ingestion, swallowing); toxic or irritant materials (paints, solvents, cleaners); fall risk on standing or moving; water and electricity. Every activity has every field filled, with either a flag or "none identified" approved by the reviewer.

Acceptance:
- Schema check fails on an empty safety field.
- "None identified" needs a reviewer's name on the record.
- Each flag displays on the activity card and the printable card.

Depends on: [DESIGN §5](../../../DESIGN.md), L10N-005.
Risks / not doing: Do not write "safe" as a claim. Describe the flags.

### TSA-024 · Supervision and food-as-material rules
Priority P0 · Phase S2 · Status new · Pillars: all

Why: A child, or an adult with reduced swallowing or cognitive capacity, may be at risk from small objects and food [R2 §7; DESIGN §5].

What: Supervision levels: none, situational, adult supervision required. Activities for children with small parts or for people who may swallow objects say so. Edible materials need a reviewer's approval and a clear note on swallowing risk and allergens. We do not give medical advice on swallowing: we say when to ask a care team.

Acceptance:
- Any activity with a small part or edible material carries a supervision line.
- No edible material is used in an activity described as suitable for people with swallowing difficulty unless the reviewer approves.
- Allergen wording is localized (L10N-015) and reviewed.

Depends on: TSA-023, L10N-013.
Risks / not doing: Do not describe food as therapeutic.

### TSA-025 · Stop-and-switch note
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: No one should feel pressure to finish an activity [MISSION, "Consent"; DESIGN voice].

What: Each activity has a visible stop note ("It is fine to stop") and the signs that suggest pausing (pain, distress, fatigue) in plain words. The note is not a medical instruction.

Acceptance:
- Stop note on every card and in the printable.
- Reviewed for tone by a native reviewer in each language.

Depends on: TSA-008.
Risks / not doing: Do not frame stopping as failure.

### TSA-026 · Scope statement on each card
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Adaptations are not medical advice, and visitors must see that on the page they use [MISSION; SEO.md §11.1].

What: One sentence on each activity card and printable: the activity is for enjoyment and time together, adaptations are suggestions, and questions about health or safety go to a care team or professional.

Acceptance:
- Visible without a click on every card and printable.
- Wording reviewed per locale.

Depends on: TSA-028.
Risks / not doing: Do not bury the statement in a footer.

### TSA-027 · Crisis route on activities that invite disclosure
Priority P0 · Phase S2 · Status new · Pillars: CALM, CARE, TOGETHER

Why: An activity that invites personal memories, feelings or grief can surface distress without warning. R3 found no creative-activity site with a visible crisis route on its activity pages [R3 §6, §4.4].

What: Any activity that invites disclosure, journaling about feelings or grief carries a visible, plain-language crisis route. Routes are verified per locale (L10N-009). The prompt never asks the person to describe a loss or diagnosis. There is no wellbeing score, and no disclosure is stored in analytics.

Acceptance:
- Every disclosure-inviting activity lists its crisis route on the page and in print.
- Route numbers and services verified per locale, with official sources.
- A review confirms no prompt asks for a loss or diagnosis.

Depends on: L10N-009, [CALM](10-pillar-creative-wellbeing.md).
Risks / not doing: Do not wait for a keyword match to show the route.

---

## E. Claims

### TSA-028 · Claims vocabulary and banned words
Priority P0 · Phase S1 · Status new · Pillars: all

Why: Therapy and treatment words spread quickly into marketing and create regulatory and trust risk [R3 §7; plan README, claims].

What: Use: creative, recreational, enjoyable, calming for some people, a way to make something together, a chance to notice how you feel. Avoid: therapy, therapeutic, healing, treats, heals, cures, improves memory, reduces anxiety, proven, scientifically shown [R3 §5 wording rules]. The rule applies to the website, the app, store copy, social posts, partner sheets and video captions.

Acceptance:
- Lint check for banned words in every locale's copy (translated equivalents listed by the reviewer).
- Each benefit sentence traces to a row in the evidence table (TSA-031).

Depends on: TSA-031, [L10N-007](13-localization.md).
Risks / not doing: Do not allow the banned words in quoted third-party text without a note.

### TSA-029 · No cognitive or brain-training outcome claims
Priority P0 · Phase S2 · Status new · Pillars: CARE, PLAY, CALM

Why: Brain-training claims are the template for regulatory action [R4 §7, FTC action]. The plan says app copy must not claim anything about cognition, memory, agitation, sundowning, caregiver burden or disease course [plan README, claims].

What: No cognitive, memory, brain-health or disease-course claim in any copy or metadata. Games are described by what they are and what they do together, never as exercises that improve something.

Acceptance:
- Copy review checklist includes this rule.
- Store copy reviewed before each submission.

Depends on: TSA-028.
Risks / not doing: Do not use "mental acuity" wording, even if a regulator permits some wellness phrasing [R3 §7 on FDA wellness].

### TSA-030 · Art therapy boundary
Priority P0 · Phase S2 · Status new · Pillars: CALM, CARE

Why: Art therapy is a credentialed clinical profession [MISSION; R3 §7]. Crafts sold as therapy create false trust.

What: The term is used only to describe the profession, with a citation and a pointer to credentialed practitioners. No activity is called art therapy. Activities that touch emotion, grief, trauma or dementia behavior need a credentialed review and a clear non-clinical scope (see TSA-034). No claim that a registered therapist supervised or designed an activity unless one did, in writing.

Acceptance:
- Every use of "art therapy" in the site is a profession description with a citation.
- Credentialed review record for each relevant activity.

Depends on: TSA-034.
Risks / not doing: Do not market a credential we have not verified.

### TSA-031 · Evidence labels next to benefit sentences
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Honest evidence labels build trust, and no app R3 reviewed showed the strength of evidence next to its claim [R3 §6].

What: A table of benefit sentences with strength (strong, moderate, weak, none), source and date, using R3 §5 as the starting list. A benefit sentence appears on a page only if it is in the table and worded as the table allows.

Acceptance:
- Table in the repo, dated.
- Each benefit sentence on a page links to its row (or the sentence is removed).

Depends on: [research 03](research/03-art-therapy-wellbeing.md).
Risks / not doing: Do not promote a weak finding to a claim.

### TSA-032 · Store, partner and marketing copy under the same policy
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Store copy is read as the app's intended purpose, and partner sheets are read as endorsements [R3 §7; plan README].

What: Store listings, partner sheets, press text, social posts and outreach emails pass the claims policy. Partners may use our words but may not add claims.

Acceptance:
- Pre-submission check on each store listing.
- Partner sheets reviewed before sending.

Depends on: TSA-028, [SEO-025](12-search-geo-distribution.md).
Risks / not doing: Do not let an outreach email describe the site more strongly than the site does.

---

## F. Editorial review and corrections

### TSA-033 · Editorial policy and roles
Priority P0 · Phase S2 · Status partial · Pillars: all

Why: Readers need to know who wrote and checked each page. Visible review dates beat claims of expertise [R5 §2.2].

What: Publish the editorial policy (`/editorial-policy/`): roles (author, editor, reviewer), who approves publication, how AI assistance is disclosed, and how the activity was tested. Each page shows its author or team, and the date of last substantive review.

Acceptance:
- Policy page live in each reviewed language.
- Roles and dates on every activity, from the activity record.
- No role or credential shown without a record.

Depends on: [SEO-012](12-search-geo-distribution.md), [L10N-004](13-localization.md).
Risks / not doing: Do not describe testing that did not happen.

### TSA-034 · Credentialed review scope record
Priority P0 · Phase S1 · Status new · Pillars: CARE, CALM, GROW

Why: A reviewer's name on a page implies endorsement. R3 and DESIGN require the reviewer's name, credential, date and scope on the page [R3 §7; DESIGN §5].

What: When a page touches emotion, grief, trauma, mental health, dementia behavior, or adaptation for a condition, a credentialed reviewer checks it. The record holds the name, credential, date, scope, what the activity is not for, who should not use it unsupervised, and the stop signals. The page shows only what the record says.

Acceptance:
- Record per page, linked from the page.
- No "clinically reviewed" badge without a documented review.
- Reviewer's written permission to be named, on file.

Depends on: TSA-033, [README](README.md) open questions (named reviewers).
Risks / not doing: A review does not turn a craft into therapy [R3 §7].

### TSA-035 · Corrections route and log
Priority P0 · Phase S1 · Status new · Pillars: all

Why: Corrections build trust, and a corrections log shows that errors are taken seriously [SEO.md §4.1 `/corrections/`].

What: A corrections page and a visible log of changes that matter (safety, factual, claim). Any reader can report an error from every page. Each report gets a log entry and a decision.

Acceptance:
- Corrections page live, with the log format.
- Report link on every page, tested.
- Response target for safety reports is a proposal set by the maintainer (TSA-045).

Depends on: TSA-033.
Risks / not doing: Do not hide a correction by editing without a log line for safety or claim changes.

### TSA-036 · Review cadence
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Activities drift out of date, and some safety information changes with products and standards.

What: Each activity has a review interval (proposal: 12 months, set by the maintainer). Overdue pages show a status to the editor and a note to the reader if their safety content is overdue.

Acceptance:
- Interval set and recorded.
- Overdue report in the editorial log.
- No automatic date refresh (SEO-012).

Depends on: TSA-033.
Risks / not doing: Do not refresh a date without a substantive review.

### TSA-037 · AI-assistance disclosure
Priority P1 · Phase S2 · Status new · Pillars: all

Why: AI assistance does not count as human testing [SEO.md §5.3]. Generated steps or images presented as verified are misleading.

What: Record where AI helped (research, drafting, translation draft, formatting). Disclose it in the editorial policy. Generated steps and images are not published as verified; a person tests the activity.

Acceptance:
- Disclosure line on the editorial policy.
- AI use logged per page in the editorial record.
- No generated image used as a photo of a real activity.

Depends on: TSA-033.
Risks / not doing: Do not use AI-written reviews or testimonials [SEO.md §5.3].

---

## G. User content and image rights

### TSA-038 · Image rights and consent log
Priority P0 · Phase S1 · Status new · Pillars: all

Why: Images of older adults and children create image-rights and consent issues [R5 §5.5]. A person living with dementia may not be able to consent, and the rules for a legal representative vary by place.

What: Every image has a log entry: source, license, date, the people shown, and the consent or release. Identifiable people need written consent. For someone who cannot consent, the route follows local law and is checked by counsel. No child image without a release (TSA-021).

Acceptance:
- Log complete for every published image, with a check at release.
- No stock image presented as a field test (SEO.md §5.3).
- Images removed on request within a stated period.

Depends on: TSA-021, [platform](15-platform-data-architecture.md).
Risks / not doing: Do not publish a face in a photo the subject has not agreed to.

### TSA-039 · Moderation and review integrity for user content
Priority P1 · Phase S2 · Status new · Pillars: all (user content; see [community](11-community-ugc.md))

Why: Reported content needs a quick response, and ratings are easily manipulated [R5 §5.5].

What: A public reporting path, a moderation queue, a response standard set by the maintainer, and clear removal rules. Ratings and reviews are off until moderation can handle them. No incentives for ratings. No personal data in public user content.

Acceptance:
- Report path tested. Queue reviewed at a set interval.
- Removal and appeal rules published.
- No review or rating shown without a moderation step.

Depends on: [community and UGC](11-community-ugc.md).
Risks / not doing: Do not launch community features before moderation.

### TSA-040 · Platform law check for user content
Priority P1 · Phase S2 · Status new · Pillars: COM

Why: The EU Digital Services Act and the UK Online Safety Act may apply once users can post. R5 marks both as general knowledge to verify [R5 §5.5].

What: Counsel confirms which duties apply to the site and app before any user content goes live, including notice-and-action, protections for minors and risk assessment.

Acceptance:
- Written opinion or decision record before launch.
- Duties implemented or the feature stays off.

Depends on: TSA-039.
Risks / not doing: Do not rely on this summary as legal advice.

---

## H. Security

### TSA-041 · Security headers and content security policy
Priority P0 · Phase S2 · Status partial · Pillars: all

Why: A public site is a target, and the headers are cheap protection. The user's security rule requires a production CSP and listed headers.

What: Check `site/public/_headers` against the target headers: HTTPS with HSTS, `X-Content-Type-Options: nosniff`, frame protection, a strict `Referrer-Policy`, a `Permissions-Policy` that denies camera, microphone and geolocation, and a CSP. The CSP uses only the origins the site needs. For a static site, a hash-based CSP may fit better than per-request nonces. Choose one with the build team.

Acceptance:
- Header scan recorded with date, showing each header.
- CSP has no `unsafe-inline` for scripts.
- Any third-party origin is listed with a reason.

Depends on: TSA-042.
Risks / not doing: Do not copy a CSP block unchanged. Adjust it to the site.

### TSA-042 · Third-party scripts, fonts and subresource integrity
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Third-party scripts add risk and slow pages [DESIGN §7; user's security rule].

What: An inventory of third-party origins. Fonts are self-hosted where possible. Any CDN asset has subresource integrity. No third-party script on activity pages unless approved by TSA-011.

Acceptance:
- Inventory matches the rendered page.
- SRI present for every external asset.

Depends on: TSA-011, TSA-041.
Risks / not doing: Do not load a script for a feature that is not yet built.

### TSA-043 · Secrets and dependencies
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Leaked keys and vulnerable packages are common failure paths.

What: No secrets in the repo. Store keys in the platform's secret manager. Scan dependencies on each release. Rotate any exposed key.

Acceptance:
- Secret scan in CI.
- Dependency scan recorded per release.
- Signing keys for the app stored outside the repo.

Depends on: none.
Risks / not doing: Do not commit a test key that works in production.

### TSA-044 · Forms: anti-abuse without heavy CAPTCHA
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Forms (for organizations, contact, email sign-up) are abuse targets. Heavy CAPTCHA defaults harm accessibility [user's security rule].

What: Server-side validation, rate limiting, a honeypot field and light bot checks. Any CAPTCHA is a last resort and is itself tested with assistive technology.

Acceptance:
- Forms tested with validation off in the browser.
- No CAPTCHA that fails for a screen-reader user.

Depends on: [web features](03-features-web.md).
Risks / not doing: Do not store form data that is not needed.

---

## I. Incidents

### TSA-045 · Response to an unsafe or wrong activity
Priority P0 · Phase S1 · Status new · Pillars: all

Why: An unsafe activity or wrong safety instruction is a real harm, and printed copies cannot be updated [R5 §4].

What: A written process: a report reaches the editor the same day (target: set by the maintainer). The activity is held or given a warning while it is reviewed. The fix is published with a correction log entry (TSA-035). Partners who use the activity are told. Printed copies are identified by version and date, and the site publishes a notice for the version that is wrong.

Acceptance:
- Process document with owners and targets (targets proposed, not measured).
- Drill run once before the S1 gate, with the outcome recorded.
- Version and date on every printable.

Depends on: TSA-035, TSA-046.
Risks / not doing: Do not wait for a full review before a warning goes up.

### TSA-046 · Privacy and security breach process
Priority P0 · Phase S2 · Status new · Pillars: all

Why: Data breaches have statutory notice rules. Under GDPR, a notifiable breach must be reported to the supervisory authority within 72 hours where required (general knowledge; verify with counsel).

What: An incident response plan: detection, containment, assessment, notification to authorities and users where required, and a log. Owners named.

Acceptance:
- Plan on file with owners and contacts.
- Tabletop exercise recorded before the S1 gate.
- Notification templates reviewed by counsel.

Depends on: TSA-011, TSA-043.
Risks / not doing: Do not promise a timeline to users that counsel has not checked.

### TSA-047 · Safety report route
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Readers must be able to report an unsafe instruction from the page they are reading.

What: A visible "report a safety problem" link on every activity and printable, going to a monitored address. The report form does not ask for personal data.

Acceptance:
- Link tested on every template.
- Monitored address with an owner.

Depends on: TSA-045.
Risks / not doing: Do not route safety reports into a general feedback box.

---

## J. Transparency

### TSA-048 · Transparency pages set
Priority P0 · Phase S2 · Status partial · Pillars: all

Why: Trust is the Definition of #1 [README]. Readers need to find who runs the site, how it is paid for, how content is checked and how to complain.

What: These pages, in each reviewed language: `/about/`, `/editorial-policy/`, `/safety-and-scope/`, `/accessibility/` (TSA-007), `/corrections/` (TSA-035), privacy notice (TSA-017), terms of free use and print license, business and funding statement (see [business model](16-business-model.md)), and contact. Baseline has the editorial policy, the safety and medical disclaimer and the FAQ.

Acceptance:
- Each page exists and is linked from the footer on every page.
- Each page is dated and reviewed (TSA-033).

Depends on: [business model](16-business-model.md).
Risks / not doing: Do not describe the business in a way the business model does not support.

### TSA-049 · Sponsorship and partner disclosure
Priority P1 · Phase S2 · Status new · Pillars: all

Why: VISION allows only carefully disclosed sponsorships, and partners must not be read as endorsers without permission [VISION "Revenue"; SEO-025].

What: Any sponsorship, paid placement or partner relationship is disclosed on the page where it appears. No sponsor is placed in an activity. Partner logos only with written permission.

Acceptance:
- Disclosure line tested on each sponsored or partner page.
- Partner list is public and current.

Depends on: [business model](16-business-model.md).
Risks / not doing: Do not accept a sponsorship that would need an activity to change.

### TSA-050 · Physical kit product safety, if sold
Priority P3 · Phase S4 · Status new · Pillars: all

Why: If any physical kit is sold, product-safety rules for toys and consumer goods may apply, including small-parts and labeling duties (verify per market).

What: No kit is sold until counsel confirms the product-safety duties for each market and the labeling in TSA-023 is printed on the pack.

Acceptance:
- Counsel check recorded per market before the first sale.
- Labels tested.

Depends on: [business model](16-business-model.md).
Risks / not doing: The free core does not include kits. Do not add one to the free core.

---

## Open questions

1. **Analytics.** Is GA4 live? If yes, what does it send, and does it conflict with TSA-012 and DESIGN §7?
2. **Health data posture.** Counsel must confirm the TSA-013 posture before any future feature asks about a person's condition.
3. **Children's ages.** Which minimum age applies in each launched market under COPPA, the UK code and national laws?
4. **Named reviewers.** TSA-034 needs named credentialed reviewers for the dementia and craft-for-adults scopes. Who are they?
5. **Response targets.** TSA-045 and TSA-035 need targets set by the maintainer. This file proposes none as measured.
6. **Build 1.6.0 machine text.** Protected segments in machine-made languages conflict with [L10N-005](13-localization.md). This must be decided before approval.
7. **Legal points to verify.** R5 and R4 mark several legal and regulatory points as unverified: the EAA scope and microenterprise exemption, the UK Online Safety Act and DSA duties, the GDPR breach timeline, the ICO standard numbering, and the FDA wellness scope. Counsel verifies each before the matching item ships.
