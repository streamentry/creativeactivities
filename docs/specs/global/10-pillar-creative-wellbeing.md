# CALM: creative wellbeing

This file is the content program for the **CALM** pillar: creative activities that people use for calm, connection, enjoyment, grief and stress, offered as creative wellbeing and never as therapy. It sets the scope, the art-therapy boundary and the wording rules that every CALM page and every app string must pass, the trauma-informed defaults, crisis signposting by country, the credentialed reviewer roles, the referral guides, the activity families, and the content we will not publish. Items use the `CNT-1000s` block. Care settings for older adults are in [CARE](09-pillar-older-adults-dementia.md); children's emotional content is in [GROW](08-pillar-parenting-kids.md) and stays out of CALM until it has its own review.

**Read with:** [README](README.md) · [_WRITER_BRIEF](_WRITER_BRIEF.md) · [06 content library](06-content-library.md) · [09 CARE](09-pillar-older-adults-dementia.md) · [14 trust, safety, accessibility, privacy](14-trust-safety-accessibility-privacy.md) · [MISSION](../../../MISSION.md) · [DESIGN](../../../DESIGN.md) · [wellbeing spec](../wellbeing.md) · [R3 art therapy and wellbeing](research/03-art-therapy-wellbeing.md) · [R4 games](research/04-games-engagement.md)

## 1. Scope: creative wellbeing, not therapy

CALM covers ordinary creative activity that people do for enjoyment and some calm. It includes drawing, coloring, collage, simple journaling in the form of lists and sketches, music for mood, nature-based making, and making something by hand in a quiet hour.

Four things are true of every CALM page:

1. **It is creative wellbeing or a creative activity.** A page may say that people find an activity calming, enjoyable or a way to notice how they feel. It does not say the activity treats, heals, cures or prevents any condition.
2. **It does not ask for a diagnosis, a score or a history.** No mood rating, no "how are you today" scale, no "wellbeing score", no streak.
3. **It names its limits.** Every CALM activity page carries the line: *"This is a creative activity, not therapy or medical advice."* (R3 §3, adopted here.)
4. **It leads to help when help is needed.** Pages that touch feelings, grief or distress carry a visible crisis route (section 5), and pages about art therapy point to qualified professionals (section 7).

**Relationship to the app.** The app's Daily moment, Activity planner and My progress pages are specified in [wellbeing spec](../wellbeing.md). They are recreational and do not claim to train or protect anything. CALM copy and app copy follow the same wording rules, and store copy changes need the same review (wellbeing.md, "Maintainer decisions"). The app's Healthy habits page covers prevention and risk factors under its own rules; CALM does not repeat or extend those claims.

## 2. The art-therapy boundary

Art therapy is a regulated profession in some countries and a protected title in others (R3 §2). Professional bodies use the term to describe a practice inside a clinical or psychotherapeutic relationship. Consumer sites often use it loosely (R3 §2 and §7 cite Calm's blog and a coloring app listing). MISSION says: "Art therapy" is a professional practice, not a marketing synonym for crafts. This section turns that into rules.

**CNT-1000 · Art-therapy boundary policy** · P0 · Phase S1 · Status new · Pillars: CALM (all)

Why: MISSION non-negotiable 6 and VISION "evidence and humility"; R3 §7 regulatory exposure (Apple 1.4.1, FDA general wellness, MHRA guidance, Google Play health policy) and credential misuse. [R3 §5, §7]

What: CALM uses these terms, and only these, for its own activities:

| Use | Do not use |
|---|---|
| creative activity, creative wellbeing, making something, enjoyment, calm for some people, a way to notice how you feel, a quiet hour | art therapy (as a label on our activities), therapeutic, therapy, healing, treats, heals, cures, recovery (as a claim), improves memory, reduces anxiety, lifts depression, proven, scientifically shown, clinically tested |
| "Art therapy is a profession. This is not." (explainer context only) | "Art for anxiety", "art for depression", "art for PTSD" (any condition in a title or URL) |
| "Some people find this calming." | "Relaxation, stress relief or art therapy" (listing copy from a competitor, R3 §2; never copy) |

Exceptions, all narrow:
- **Explainer pages** (for example [art-therapy-or-creative-activity](../../../site/src/content/guides/activities/art-therapy-or-creative-activity.md) and [finding-an-art-therapist](../../../site/src/content/guides/activities/finding-an-art-therapist.md)) may use "art therapy" to describe the profession, with a source, and must not use it as a label on an activity.
- **Quoted professional descriptions** (for example AATA's definition) may be quoted once, with the source and date, and marked as the profession's own words.

Acceptance:
- A content lint runs on the site build and on app strings. It fails on the banned terms in the right-hand column of the table, with an explicit allow-list for the explainer pages above. The app's habits test (`test/features/habits/habits_page_test.dart`) is the model.
- Every benefit sentence on a CALM page traces to a row in section 3, with the strength stated in the review record.
- No page title, meta description, URL slug or alt text uses a condition name with "art" or "music" unless the page is an explainer.
- The three existing guides that conflict with this table are fixed under CNT-960 in [CARE](09-pillar-older-adults-dementia.md#11-the-88-existing-guides), and the wording rules here apply to them.

Risks / not doing: no search-led pages for "art therapy near me" or for treatment; no lead generation for therapy providers.

## 3. Claims, evidence and phrasing

Every benefit statement on a CALM page must pass this table. It is adapted from R3 §5, which rates evidence from R3's reading of sources (not a formal grading). Ratings are judgement and are shown on the review record. Where a source needs checking, it is marked.

**CNT-1001 · Claim register and phrasing rules** · P0 · Phase S1 · Status new · Pillars: CALM, CARE

| Claim | Evidence (from R3) | Strength | How we may phrase it on site |
|---|---|---|---|
| Arts engagement is linked to wellbeing and social connection (population) | WHO Health Evidence Network scoping review (Fancourt and Finn, 2019); the number of studies needs checking | Moderate to strong | "Creative activities are linked to enjoyment and connection." |
| Art therapy as a professional treatment improves mental health symptoms | Uttley et al. (2015) HTA: 15 trials, mostly low to moderate quality; harms noted (unresolved emotion, unskilled facilitation, abrupt endings) | Weak | Only as the profession's own description, with citation. Never as our claim. |
| Coloring reduces anxiety | Curry and Kasser (2005), n=84 students; Flett et al. (2017), n=104; some null results (Mantzios and Giannou, 2018) | Moderate for short samples; mixed | "Some people find coloring calming." Do not write "reduces anxiety". |
| Coloring improves mindfulness | Mixed results across experiments | Weak | Do not claim. |
| Making art lowers cortisol | Kaimal, Ray and Muniz (2016), n=39 healthy adults, 45 minutes; full text not reviewed | Weak to moderate | "Some studies have found a change in stress hormones after making art. Results vary." No percentages. |
| Listening to music reduces anxiety | A 2022 meta-analysis (k=21, mostly non-clinical samples); citation to verify | Moderate (verify) | "Listening to music you like can help you feel calmer for a while." |
| Music therapy helps depression and anxiety | 2024 transdiagnostic meta-review; depression reviews methodologically weak | Weak to moderate | Not for our product. Refer to a qualified music therapist ([CNT-1020](#7-referral-guides)). |
| Arts programs help people with dementia | Letrondo et al. (2022) systematic review; heterogeneous | Weak to moderate | "Many people with dementia enjoy making things together. Check with their care team." (CARE) |
| Museum or arts programs reduce loneliness | Museums on Prescription (UCL; pre-post, no confirmed control); small self-reported evaluations | Weak to moderate | "Some programs report that participants felt less isolated." |
| Arts on prescription improves health | NASP (2022) rapid review; evaluations still emerging | Moderate for direction; weak for size | "Arts on prescription is being tested across the UK." |
| Journaling improves wellbeing | Mostly observational and self-help literature | Weak | "A practice some people use to notice how they feel." |
| Creative activity helps grief | Weiskittle and Gramling (2018), 27 studies, mixed efficacy | Weak | "Some people find making something helpful when they are grieving. You can stop at any time." |

Rules that apply to the table:
- A new benefit needs a new row, a dated source and a reviewer's sign-off before it appears.
- A "Strength: weak" row never appears in a headline, a store description or a meta description.
- Source numbers marked "verify" must be checked against the full text before a page uses them. R3 summarized many sources from abstracts and search results.
- The table is not a bibliography for the site. Pages cite the sources they actually use.

## 4. Trauma-informed defaults

Trauma and grief are common in the audience. The defaults below apply to every CALM activity, and to any app or site feature that asks for personal reflection. They adapt SAMHSA's six principles (safety; trustworthiness and transparency; peer support; collaboration and mutuality; empowerment, voice and choice; cultural, historical and gender issues) and R3 §4.3.

**CNT-1002 · Trauma-informed defaults for CALM** · P0 · Phase S1 · Status new · Pillars: CALM, CARE, GROW (review)

What:
1. **No prompt asks anyone to depict trauma, abuse, loss, illness or a diagnosis.** Prompts are about materials, shapes, colors, textures and the sensory experience of making. "Draw what is on your table" is a default; "Draw how you felt" is not.
2. **Choice, every time.** Each activity offers a blank, a template, or "no drawing, just color". Choosing none is an equal path.
3. **Always-visible exit.** A "Stop here" control, plain text, present on every step, works without a timer and without a reason.
4. **No timers, counts or scores.** No countdowns, no streak, no "you finished 3 this week", no mood graph. R4 and wellbeing.md apply.
5. **No forced sharing.** Nothing is posted, shared or saved to a server without an explicit action. Local only for personal reflection (see [wellbeing spec](../wellbeing.md) for the storage model).
6. **Content notes.** Any activity that mentions grief, loss, illness or family conflict says so at the top, in one sentence, and offers a lighter alternative.
7. **No images of distress.** No faces in tears, no hospital beds in close-up on a CALM page, no hands holding a letter from a loved one unless the image is licensed and reviewed.
8. **Permission to stop.** The line "It is fine to stop" (DESIGN.md §5) appears on every CALM activity, and the stopped state is not treated as failure anywhere in the product.
9. **Safe default on uncertainty.** If a page is unclear whether it touches distress, it gets the crisis route in section 5.

Acceptance:
- A usability test (with at least some participants who have had a bereavement or a stress-related break) finds no prompt that felt like a demand to disclose.
- Every CALM activity has a stop control that is reachable by keyboard and screen reader, and works with reduced motion.
- No CALM event in analytics carries a feeling, a score or a free-text story (DESIGN.md §7; R3 §4.4). The activity name is the event payload.

Risks / not doing: we do not offer exposure exercises, trauma processing, guided grief therapy or any structured protocol.

## 5. Crisis signposting

Any activity that invites personal reflection, journaling about feelings, or remembrance carries a visible, plain-language crisis route. The trigger is the content type, not a keyword match (R3 §4.4). Nothing on the site or in the app diagnoses, scores or labels a user from their answers.

**CNT-1003 · Crisis route by country** · P0 · Phase S1 · Status partial · Pillars: CALM, CARE (caregivers), GROW (review)

Why: R3 §4.4 found no creative-activity product with a visible crisis route on its activity pages, and says to verify every number before publishing. [R3 §4.4, §6]

What: a crisis block (with name, number or text instruction, hours and a link to the official site) appears on CALM reflection pages, grief and remembrance pages, and caregiver hubs. The block is generated from a country table, shown by the visitor's chosen country or the site's language and region, and falls back to a neutral directory link. The table below lists only what R3 checked and marks the rest.

| Country | Service | Route | Hours | Status |
|---|---|---|---|---|
| United Kingdom and Ireland | Samaritans | Call 116 123 | 24 hours, free (R3 cites NHS suicide support page) | Checked in R3; confirm on Samaritans and NHS pages before launch |
| United Kingdom | Shout | Text 85258 | 24 hours, free | Checked in R3 (secondary); confirm on Shout's own site |
| United States | 988 Suicide & Crisis Lifeline | Call or text 988; chat on the 988 site | 24 hours | Third-party only in R3; confirm on the official 988 site |
| Canada | Crisis service (9-8-8) | Call or text 9-8-8 | Not checked in R3 | **UNVERIFIED**; confirm on a national source |
| Australia | Lifeline | Call 13 11 14 | Not checked in R3 | **UNVERIFIED**; confirm on Lifeline's site |
| New Zealand | Support line | Not checked in R3 | | **UNVERIFIED**; confirm on a national source |
| Any other country | Local emergency number and a directory of helplines | Directory link (not checked in R3) | | **UNVERIFIED**; do not publish a number for that country until it is checked |

Acceptance:
- Every number in the table has a dated source and a reviewer check before the country goes live. Unverified rows are not shown as numbers.
- The block says what to do in an emergency, in one line, with the local emergency number (also verified per country).
- The block is shown in the page's first screen on reflection and grief pages, and on the caregiver hub.
- No analytics event records the visitor's use of the block.

Risks / not doing: we do not run a helpline, do not chat with users in crisis, and do not offer a "wellbeing check" that scores risk.

## 6. Credentialed reviewers

Art therapy is a credentialed profession. Activities that touch emotion, grief, trauma or mental health need reviewers who hold the right credential, and the credential must be checked, not assumed.

**CNT-1004 · CALM reviewer roles and review record** · P0 · Phase S1 · Status new · Pillars: CALM

Roles (at least one for each page type before it is published):

| Role | Needed for | Credential to check (from R3 §2) |
|---|---|---|
| Registered art therapist | Any art-making page with emotional content, and every claim about art therapy | US: ATR or ATR-BC (Art Therapy Credentials Board). UK: HCPC-registered art therapist (protected title; check the HCPC register). Other countries: the national register, if one exists |
| Registered music therapist | Music pages that make any mood claim | Check the board or register in the reviewer's country (for example CBMT in the US; HCPC in the UK). Not verified in R3 |
| Psychologist or counsellor | Crisis route wording and any reflection page | Their own national register. Not checked in R3 |
| Grief-informed practitioner | Remembrance and grief pages | Varies by country; ask for the body that regulates or accredits them. Not checked in R3 |
| Lived-experience reviewer | Tone, stop wording, "what it felt like", and all CALM pages | No credential; paid for time; named only with written permission |

Process (applies to all CALM items):
- The review record shows reviewer role, name (only with written permission), credential and the body that holds it, date, scope, what the activity is **not** for, who should not use it without support, and the stop signals.
- The reviewer confirms their scope. A registered art therapist who reviews a coloring page has not made it therapy, and the page says so.
- The site does not show a "clinically reviewed" or "therapist approved" badge unless the review record exists (R3 §7; DESIGN.md §5).
- A reviewer may decline. A declined page is not published.
- Reviewers' professional affiliations are not used to market the site. No endorsement from a professional body without its written permission.

## 7. Referral guides

People who are struggling sometimes arrive at CALM looking for a professional. The site helps them find one without selling anything.

**CNT-1020 · Referral guides** · P1 · Phase S1 (existing) and S2 (new) · Status partial · Pillars: CALM

What:
- **Existing (keep, review, link):** [finding-an-art-therapist](../../../site/src/content/guides/activities/finding-an-art-therapist.md) (US ATR and ATR-BC checks; UK HCPC register; first-session questions) and [art-therapy-or-creative-activity](../../../site/src/content/guides/activities/art-therapy-or-creative-activity.md). Both need the claim register check in section 3 and a credentialed review record.
- **New, S2:** "How to find a music therapist (US and UK)", "Talking to your doctor about low mood or stress: a short guide" (no activity recommendation in the same paragraph; crisis route at top), and "Creative activity and professional support: what each is for". Each one: a referral to a doctor, a licensed professional or the national register; no provider listings; no affiliate links.

Acceptance:
- Each referral guide names the register or board to check, with the official URL, and a review date.
- No provider is recommended by name. No paid listing, no lead form.
- The "talk to a doctor" line appears before any activity suggestion.

Risks / not doing: directories of therapists, booking links and cost comparisons. These need a separate business and trust review ([16 business model](16-business-model.md)).

## 8. Activity families

Activity families are groups of activity types. Target counts are for new canonical cards (not variations) across S1 to S3, and are gated by the evidence in [roadmap](18-roadmap.md). Every card uses the activity-card template in DESIGN.md §4B and the CALM blocks in sections 2 to 5.

| CNT | Family | What it is | Boundary and safety notes | Target S1 / S3 |
|---|---|---|---|---|
| CNT-1010 | Calm drawing and doodling | Repeating patterns, zentangle-style shapes (without the trademarked term), contour lines of a plant or a cup | Structure is the calm element. Never "draw your feelings". Blank or template option | 1 / 3 |
| CNT-1011 | Coloring | Adult color sheets, mandalas, large-print outline sheets | Use "calming for some people". No anxiety claims. Do not reproduce licensed illustrations | 0 / 2 (coloring pages sit in [05 games](05-games.md)) |
| CNT-1012 | Collage | Torn paper, magazine-free collage, photo collage, texture board | Use materials that are safe to tear; choose scrap or own photos. Never use photos of people in distress | 1 / 3 |
| CNT-1013 | Journaling (non-disclosure) | Lists, sketches of the day, one-word notes, a color for today | Prompts are about objects, weather, color, sound. No "how did that make you feel". Local only. Crisis route on the page. No mood scores | 0 / 2 (S2, after reviewer sign-off) |
| CNT-1014 | Music for mood | Making a playlist for a quiet hour, choosing a color to match a song, rhythm with a shaker | Say "music you like can help you feel calmer for a while". Never music therapy. Music licenses: no copyrighted lyrics in our copy | 0 / 2 |
| CNT-1015 | Nature art | Pressed leaves, leaf rubbings, natural paint, a pebble with a pencil | Plant and allergen check. Foraging is not included. Walking outside is a suggestion, not a benefit (wellbeing spec) | 1 / 3 |
| CNT-1016 | Gratitude crafts | A card for someone, a jar of small notes, a "thank you" tag | Gratitude is an invitation, not a task. No "list three things" as a daily requirement. Permission to skip | 0 / 1 |
| CNT-1017 | Grief and remembrance making | Memory box, pressed-flower card, candle holder, a page of a remembrance book, photo frame | Making, not depicting. No prompt to describe the loss. Content note at top. Crisis route. Reviewed by grief-informed practitioner. Not on death anniversaries, no reminders | 0 / 2 (S2, after review; see section 9) |
| CNT-1018 | Stress-relief making | A quiet hour of simple making: string bracelet, paper folding, a sachet, sorting buttons | Do not use "stress relief" in the title or the claim. Say "a quiet hour of making" | 1 / 3 |
| CNT-1019 | Creative routines | "A creative hour" pattern, a choice of three small starts, a weekly slow session | No streak, no reminder that shames, no daily goal. Wellbeing spec governs | 0 / 1 (S2, after the app's routine is device-tested) |

Priority and phase (from the [roadmap](18-roadmap.md)): CNT-1010 P2 · S2; CNT-1011 P2 · S2; CNT-1012 P2 · S2; CNT-1013 P2 · S2; CNT-1014 P2 · S2; CNT-1015 P2 · S2; CNT-1016 P2 · S2; CNT-1018 P2 · S2; CNT-1019 P2 · S2.

Totals: the first four new CALM cards (CNT-1010, 1012, 1015 and 1018) start in S2, after the boundary, wording and crisis route are in place ([roadmap](18-roadmap.md)). Calm and craft cards that are already in the library (for example `draw-repeating-patterns`, `make-a-color-collage`, `press-leaves-and-flowers`, `make-a-lavender-sachet`) are candidates for CALM review and for the wording check, not new items. Target by end of S3: 22 new cards across the ten families.

## 9. Grief and remembrance

Grief is the highest-risk CALM family. R3 §4.3 found weak evidence for creative grief practice and mixed efficacy in a 27-study review. The design defaults are strict.

- Grief remembrance is a **making** activity: a card, a memory box or a frame. It is not an exercise about the loss.
- It is optional and never triggered by a date, a notification or a calendar. No death-anniversary reminders.
- A grief content note appears at the top. The crisis route appears on the first screen.
- Language is about the person remembered, in their own words, with no prompts to describe the death or their feelings about it.
- The page does not describe any activity as grief therapy, bereavement support or healing.
- The item is S2 only. It launches after a grief-informed practitioner has reviewed it and a bereaved reviewer has tested the stop wording.

## 10. Content we will not publish

This list is binding. A request to add any of these is a product decision, not an editor's call.

1. Therapy protocols, session plans or exercises presented as therapy, treatment or a clinical program.
2. Prompts that ask people to write or draw about trauma, abuse, violence, loss details, self-harm or diagnosis.
3. Condition-led activity pages ("art for anxiety", "craft for depression", "music for PTSD", "for autistic anxiety").
4. Mood scores, wellbeing points, streaks, before-and-after mood ratings or any graph of feelings.
5. Claims about cortisol, brain chemistry, immune function, memory, or disease progression.
6. Phrases such as "heal your inner child", "release trauma", "cure", "clinically proven", "scientifically shown".
7. Testimonials that describe a cured condition or a medical outcome.
8. Ads, affiliate links or sponsored placements for therapy providers, supplements, apps that promise wellbeing outcomes, or subscription wellness products.
9. Distraction tips for people in crisis, and any "try this when you feel like hurting yourself" content.
10. Children's emotional regulation framed clinically, before GROW's own children's privacy and review work is finished.
11. Copied exercises from copyrighted books (for example the Morning Pages practice in The Artist's Way, R3 §2) or branded methods used as verbs.
12. Licensed or copied illustrations from coloring apps or publishers.
13. Pages that present a reviewer's name or credential without permission, or a "clinically reviewed" badge with no record.
14. Live chat or any service that answers a crisis.

## 11. Phasing and targets

| CNT | Item | Priority | Phase | Status |
|---|---|---|---|---|
| CNT-1000 | Art-therapy boundary policy | P0 | S2 | new |
| CNT-1001 | Claim register and phrasing rules | P0 | S2 | new |
| CNT-1002 | Trauma-informed defaults | P0 | S2 | new |
| CNT-1003 | Crisis route by country (UK, Ireland, US checked; others unverified) | P0 | S2 | partial |
| CNT-1004 | Reviewer roles and review record | P0 | S2 | new |
| CNT-1010 to 1019 | Activity families (section 8) | P1 to P2 | S1 to S3 | new |
| CNT-1020 | Referral guides | P1 | S2 | partial |
| CNT-1017 | Grief and remembrance making | P2 | S2 | new |

Shipping order: boundary and wording (1000, 1001) and the crisis route (1003) before any CALM card. Then four S1 cards with the reviewer records. Then referral guides. Then grief and journaling.

## 12. Open questions

- Which countries does the site launch crisis routes for first? The table above only has UK, Ireland and US checked.
- Who are the first credentialed reviewers (registered art therapist in the US or UK, grief-informed practitioner, psychologist)? No names exist yet. See the open question in the [README](README.md).
- Should the app's mood-color idea (R3 §3, "choose a color for how you feel today") exist at all, given the no-score rule? If yes, it is P3 and must store nothing.
- Does a "creative hour" in the app need a reminder? The wellbeing spec says no reminders by default. This needs a maintainer decision.
- Should the existing `therapeutic-art-activities-for-adults` guide be renamed? The change needs a redirect and a search check ([12 search](12-search-geo-distribution.md)).
