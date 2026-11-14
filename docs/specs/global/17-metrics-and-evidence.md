# 17. Metrics and evidence

This file defines what we measure, how we measure it without collecting health data, and how we turn results into decisions. The north star is the one VISION names: activities started, confirmed by the person who started them, not screen time. Items are `MET-###`. Every metric here is a definition or a target to test. None has a measured value yet, except where the baseline section says so.

**Read with:** [README](README.md) · [platform and data](15-platform-data-architecture.md) · [business model](16-business-model.md) · [trust, safety, accessibility and privacy](14-trust-safety-accessibility-privacy.md) · [search, GEO and distribution](12-search-geo-distribution.md) · [localization](13-localization.md) · [roadmap](18-roadmap.md) · [senior-first validation protocol](../senior-first/validation.md) · [measurement plan](../../plan/measurement.md)

Research notes are cited as [R1] craft platforms, [R2] parenting and kids, [R3] art therapy and wellbeing, [R4] games and engagement, [R5] search, scale and trust.

---

## 1. Baseline: what we actually have

- **Store, app.** First-time downloads were 7 on 2026-10-29 and 8 on 2026-10-30. iOS ratings: 0. Search rank for "dementia activities" was #1 on the same dates ([docs/plan/README.md](../../plan/README.md) §8). Apple reports usage only from opted-in devices and blanks cells under a privacy threshold, at roughly 15 installs a day, so read weeks, not days ([measurement plan](../../plan/measurement.md)).
- **Website.** GA4 `activity_*` events are live for the browser games, but the baseline table says "not read yet" ([docs/plan/README.md](../../plan/README.md) §8).
- **Usefulness.** Voluntary reuse, comprehension and usable-start tests have not been run ([docs/plan/README.md](../../plan/README.md) §8).
- **Trust.** Zero incidents recorded. No revenue ([docs/plan/README.md](../../plan/README.md) §8).
- **Founder-reported, not verified.** VISION cites about 400 organic downloads a month, mostly from App Store search. Label it as founder-reported until the store export confirms it.
- **Not yet measured at all:** confirmed activity starts, prints, saves, shares, return households, partner use, and search share per cluster.

## 2. Items

Summary: 40 items. P0 15, P1 17, P2 7, P3 1. Every item has a block here; section 3 lists all 40 in one table.

### North star and core usefulness

### MET-001 · Confirmed activity starts ("We tried this")
Priority P0 · Phase S2 · Status new · Pillars: all
Why: VISION names this as the north-star proxy. It is the only measure that counts an activity done away from the screen. The README defines #1 by it ([README](README.md#definition-of-1-how-we-will-know)).
What: a count of people who confirm they tried an activity. Web: a "We tried this" button on activity pages sends an aggregate increment ([platform](15-platform-data-architecture.md) PLAT-027). App: confirmed in a consented pilot diary. Partners: reported in aggregate.
Acceptance:
- Reported per month, per locale, per cluster, with the count and the date range.
- No identifier, cookie or health detail stored with a confirmation.
- Public figures suppress any cell under the minimum (proposed: 10).
- Self-report is reported with its response rate, because most visits never confirm.
Depends on: PLAT-027.
Risks / not doing: treating confirmations as clinical outcomes. They are not. The metric measures use, not benefit.

### MET-002 · Start rate
Priority P0 · Phase S2 · Status new · Pillars: all
Why: a raw count rises with traffic. A rate shows whether the page helps people start.
What: confirmed starts ÷ activity card views, same period, same locale and cluster.
Acceptance:
- Shown with both numerator and denominator.
- Compared with the response rate from MET-001 so a low rate is not misread.
- Target set after a three-month baseline. No target before then.
Depends on: MET-001.
Risks / not doing: optimizing the rate by making the confirmation prompt pushy. Prompts stay quiet ([DESIGN.md §9]).

### MET-003 · Prints, saves and shares per 1,000 card views
Priority P1 · Phase S2 · Status new · Pillars: all
Why: VISION calls printing and sharing the distribution loop. [R5 §4] names printables as shareable offline.
What: print actions, saves in the browser (the saved list exists), and share actions per 1,000 activity card views.
Acceptance:
- Counted without identifiers.
- Reported by activity and by cluster, with counts.
- Print counts are not treated as use. A print is a print.
Depends on: PLAT-019, PLAT-027.
Risks / not doing: counting a saved item as an activity start.

### MET-004 · Pillar input: MAKE
Priority P1 · Phase S2 · Status new · Pillars: MAKE
Why: MAKE is the craft library and the first wedge, including seated and low-dexterity versions ([VISION.md] wedge; [R5 §6] ranks seated and bedside first).
What: crafts-cluster card views and starts; share of MAKE starts where a seated, bedside or low-dexterity variation was opened.
Acceptance:
- Reported per cluster and locale.
- Variation views are counted only as page events, with no person-level data.
Depends on: [content library](06-content-library.md); PLAT-002.
Risks / not doing: judging variation success by views alone. Pair with MET-006 feedback.

### MET-005 · Pillar input: GROW (kids and parenting)
Priority P2 · Phase S3 · Status new · Pillars: GROW
Why: the pillar is not yet launched. Its input metric should be defined before launch, not after.
What: printable downloads per 1,000 parent-facing page visits, and starts reported by parents in pilot diaries. Child-directed pages are excluded from any person-level measurement.
Acceptance:
- No child identifiers, ever.
- The metric is reported only after the pillar passes its gate ([roadmap](18-roadmap.md)).
Depends on: [parenting and kids](08-pillar-parenting-kids.md); [trust, safety, accessibility and privacy](14-trust-safety-accessibility-privacy.md).
Risks / not doing: measuring children. Not done.

### MET-006 · Pillar input: CARE (older adults, dementia, caregivers)
Priority P0 · Phase S2 · Status new · Pillars: CARE
Why: CARE is the first market and the wedge in VISION. Its success depends on a caregiver finding a fit quickly.
What: starts from the situation hubs; "not a fit" feedback with a short reason code (too hard, too messy, not interested, needs supplies, not the right time); time to first usable instruction in usability sessions.
Acceptance:
- Reason codes are fixed, not free text.
- Reported with counts per hub.
- Free-text feedback is never stored in analytics.
- Health words are never part of an event.
Depends on: [positioning and audiences](01-positioning-and-audiences.md); [platform](15-platform-data-architecture.md) PLAT-024.
Risks / not doing: inferring cognition or ability from taps. Never ([senior-first product contract](../../specs/product.md)).

### MET-007 · Pillar input: CALM (creative wellbeing)
Priority P2 · Phase S3 · Status new · Pillars: CALM
Why: CALM handles grief, stress and loneliness, where people may be in distress. Its metrics must include safety.
What: starts of calm activities; views of crisis-signposting blocks on grief and stress pages (aggregate, no identifiers). A rise in signposting views is reviewed as a safety signal.
Acceptance:
- No event contains clinical or diagnostic words.
- Signposting is present on every grief and stress page.
- Reviews of signposting views happen monthly, with a named owner.
Depends on: [creative wellbeing](10-pillar-creative-wellbeing.md); [R3 §4.4].
Risks / not doing: claiming benefit for wellbeing. Measure use and safety only.

### MET-008 · Pillar input: PLAY (games)
Priority P1 · Phase S2 · Status new · Pillars: PLAY
Why: games are part of the library and a common first visit. They must be measured without scores, timers or streaks ([DESIGN.md §9]; [R4 §3]).
What: games opened; sessions completed (not scored); "rest" button uses; offline first-load success.
Acceptance:
- Explicitly not measured: scores, time played, streaks, wrong answers.
- Reported per game, with counts.
- The offline success figure comes from a test on a throttled connection and from real sessions with no personal data.
Depends on: [games](05-games.md); PLAT-034.
Risks / not doing: turning session length into a goal. [R4 §3] and VISION say short sessions are fine.

### MET-009 · Pillar input: TOGETHER (groups and intergenerational)
Priority P2 · Phase S2 · Status new · Pillars: TOGETHER
Why: TOGETHER is a lens across the pillars. The question is whether activities are actually done with other people.
What: share of starts tagged group or intergenerational, from pilot diaries and partner reports. Group size from diaries.
Acceptance:
- Reported only from consented diaries and partner summaries.
- No event on the website asks about group size.
Depends on: pilot diary protocol ([validation](../senior-first/validation.md)).
Risks / not doing: guessing group use from page views.

### Content quality and honesty

### MET-010 · Reviewed coverage of indexed pages
Priority P0 · Phase S2 · Status new · Pillars: all
Why: [R3 §7] and DESIGN §5 require that any review shown is documented. This metric measures whether that holds.
What: share of indexed (entity, locale) pairs whose review record matches the current content hash ([platform](15-platform-data-architecture.md) PLAT-005). Reported separately for health-adjacent and other pages.
Acceptance:
- Target: 100% for health-adjacent pages (a proposal to adopt).
- Reported with the count of pages in each group.
- A page with a stale review is shown as stale, not as reviewed.
Depends on: PLAT-005, PLAT-014.
Risks / not doing: counting pages with a reviewer name but no matching review record.

### MET-011 · Overdue reviews
Priority P1 · Phase S2 · Status new · Pillars: all
Why: VISION lists "updates overdue" as a quality metric. [R5 §5.6] asks for "last checked" dates.
What: count and median age of items past `next_review_due` ([platform](15-platform-data-architecture.md) PLAT-012), with a named owner per item.
Acceptance:
- Reported weekly to the owner, monthly to the maintainer.
- Health-adjacent overdue items are listed first.
Depends on: PLAT-012.
Risks / not doing: clearing the list by bumping dates. Only a review clears it.

### MET-012 · Translation coverage and staleness
Priority P0 · Phase S2 · Status new · Pillars: all
Why: [R5 §2.3] says machine text needs native review before it is shown. The plan has 19 languages held out of the index ([docs/plan/README.md](../../plan/README.md) §8).
What: for each indexed locale, the share of pages that are native-reviewed and the share that are stale.
Acceptance:
- Target: zero stale pages among indexed pairs.
- Reported per locale with the page count.
- A locale is not indexed until its coverage target is met ([localization](13-localization.md)).
Depends on: PLAT-004, PLAT-014.
Risks / not doing: counting machine translation as coverage.

### MET-013 · Correction speed
Priority P1 · Phase S2 · Status new · Pillars: all
Why: a wrong materials list or safety step can cause harm. [R5 §5.6] and DESIGN §4B require a correction route.
What: median days from report to correction, and the share of safety and material corrections fixed the same working day (proposed target).
Acceptance:
- Every report has a timestamp and an owner.
- Reported monthly, with counts.
Depends on: [trust, safety, accessibility and privacy](14-trust-safety-accessibility-privacy.md).
Risks / not doing: hiding slow fixes by closing reports without a fix.

### MET-014 · Broken links and 404s on indexed pages
Priority P1 · Phase S2 · Status partial · Pillars: all
Why: the site has a link checker in `check-site.mjs` and a post-deploy check, but no trend.
What: broken internal links and 404s on indexed pages, counted weekly from the scheduled check and platform logs (aggregate).
Acceptance:
- Target near zero; the number is set after the first month's baseline.
- Each broken external source is reported to the owner of the page.
Depends on: [platform](15-platform-data-architecture.md) PLAT-040.
Risks / not doing: counting 404s from pages that are not indexed.

### MET-015 · Source coverage on health-adjacent pages
Priority P1 · Phase S2 · Status new · Pillars: CARE, CALM
Why: [R5 §5.6] and DESIGN §10 require sources for factual claims.
What: share of health-adjacent pages with at least one dated source ([platform](15-platform-data-architecture.md) PLAT-006).
Acceptance:
- Target: 100%.
- Reported per template.
Depends on: PLAT-006.
Risks / not doing: sources that are not primary. Reviewers check the source type.

### Accessibility and safety

### MET-016 · Accessibility defects per release
Priority P0 · Phase S2 · Status partial · Pillars: all
Why: WCAG 2.2 AA is the minimum ([DESIGN.md §6]; [R5 §5.4]). The baseline says axe runs on key pages.
What: serious and critical axe violations per template, per release.
Acceptance:
- Target: zero serious or critical violations.
- A report lists each violation with its template.
- Automated scans are reported with the statement that they are necessary but not sufficient ([platform](15-platform-data-architecture.md) PLAT-038).
Depends on: PLAT-038.
Risks / not doing: treating a clean scan as accessibility.

### MET-017 · Assistive-technology task success
Priority P0 · Phase S2 · Status new · Pillars: all
Why: DESIGN §6 says to recruit users of assistive technology. Automated tests cannot show whether a person can find and start an activity.
What: share of sessions in which an assistive-technology user completes "find and start an activity" unaided, by tool (screen reader, switch, magnifier, voice control, keyboard only).
Acceptance:
- Reported with the session count and the tool.
- No single figure hides a tool with few sessions. Show n for each.
- Failures become regression tests ([platform](15-platform-data-architecture.md) PLAT-038).
Depends on: MET-029.
Risks / not doing: averaging across tools.

### MET-018 · Safety reports and safety-field completeness
Priority P0 · Phase S2 · Status partial · Pillars: all
Why: MISSION names safety as a non-negotiable. The baseline records zero incidents.
What: count of safety reports and harm or near-miss reports; share of activities with every required safety field answered (scissors, heat, choking, skin contact, allergens, falls, ingestion, supervision).
Acceptance:
- Target: every report reviewed within the same working day (proposed).
- Completeness target: 100% for published activities.
- Reports and their outcomes are kept in a private log, not in analytics.
Depends on: [trust, safety, accessibility and privacy](14-trust-safety-accessibility-privacy.md).
Risks / not doing: a low report count read as safety. Reports depend on people telling us; track the channel too.

### MET-019 · Claim-audit failures
Priority P0 · Phase S2 · Status partial · Pillars: all
Why: the site must not claim to treat, heal or improve memory. [R4 §5] and [R3 §5] set out the wording the regulators object to. `check-site.mjs` already checks claim wording.
What: count of banned claim phrases in published pages, per release.
Acceptance:
- Target: zero.
- The list of banned phrases lives in one file and is reviewed quarterly.
- Any hit blocks the release.
Depends on: [platform](15-platform-data-architecture.md) PLAT-011.
Risks / not doing: relying only on word lists. Add a human review of every health-adjacent page.

### MET-020 · Print legibility pass rate
Priority P1 · Phase S2 · Status new · Pillars: all
Why: print is a product path (DESIGN §4B). A card that does not print is not a card.
What: share of print templates that pass the print tests (one page at A4 and US Letter, no color dependency, no navigation).
Acceptance:
- Target: 100% on each release.
- Failures are fixed before the release.
Depends on: [platform](15-platform-data-architecture.md) PLAT-039.
Risks / not doing: testing on screen only.

### Search and distribution

### MET-021 · Non-branded search impressions by cluster and locale
Priority P0 · Phase S2 · Status new · Pillars: all
Why: search is the main acquisition path ([VISION.md]; [R5 §6]). Non-branded impressions show whether we are being shown for the task, not the brand.
What: Search Console non-branded impressions and clicks per cluster and per indexed locale, from the cluster query sets in [search](12-search-geo-distribution.md).
Acceptance:
- Search Console is verified for each domain and locale property ([docs/plan/README.md](../../plan/README.md) §9 flags this as open).
- Reported with the date range and the query set version.
- Baseline is a three-month window before any target.
Depends on: [search, GEO and distribution](12-search-geo-distribution.md).
Risks / not doing: judging demand by Google Ads volume. [R5 §3.1] says those figures are the wrong market.

### MET-022 · Top-three share for task queries
Priority P1 · Phase S2 · Status new · Pillars: all
Why: the VISION aim is to be the best answer to the query. Top-three positions are a clear signal.
What: share of tracked task queries where a page of ours is in the top three, checked on a fixed schedule with the method stated.
Acceptance:
- The query set is versioned and the locale is recorded.
- Rank-tracking tools are named, and any third party that receives queries is disclosed.
- Reported with the count of queries.
Depends on: MET-021; [R5 §7] (SERP audit).
Risks / not doing: chasing rank for queries we should not serve, such as care-service or medical intent.

### MET-023 · Search share per cluster
Priority P1 · Phase S2 · Status new · Pillars: all
Why: the VISION says we win by being the best answer. Search share shows whether we are taking clicks from our clusters.
What: estimated share of clicks for each cluster's query set: our clicks ÷ all clicks on those queries, estimated from Search Console and a SERP audit.
Acceptance:
- Labelled as an estimate with its method.
- Reported per cluster and locale, with the query count.
Depends on: MET-021, MET-022.
Risks / not doing: presenting an estimate as a measured share.

### MET-024 · Index coverage of indexed pairs
Priority P1 · Phase S2 · Status new · Pillars: all
Why: an indexed page that is excluded from search is wasted work, and an excluded page that should be indexed is lost demand.
What: indexed ÷ submitted pages, and the top reasons for exclusion, for indexed pairs only ([platform](15-platform-data-architecture.md) PLAT-014).
Acceptance:
- Reported weekly during launch, monthly after.
- Each exclusion reason has an owner.
Depends on: PLAT-014.
Risks / not doing: adding pages to the sitemap to change the number.

### MET-025 · AI-answer citations (exploratory)
Priority P2 · Phase S3 · Status new · Pillars: all
Why: [R5 §2.5] says citations matter more than rank inside AI answers. The reach of AI answers is disputed, so the measure stays exploratory.
What: a monthly sample of 20 to 30 prompts per cluster, checked by hand, recording whether an answer cites us.
Acceptance:
- Labelled exploratory. No target.
- The prompt list and the date are recorded.
- No promise of inclusion in any answer ([VISION.md]).
Depends on: MET-021.
Risks / not doing: treating citation counts as proof of value.

### MET-026 · Partner adoption
Priority P1 · Phase S2 · Status new · Pillars: TOGETHER
Why: partners (libraries, care homes, schools, clinicians) are part of the definition of #1 ([README](README.md#definition-of-1-how-we-will-know)).
What: active partners by type, each with a written permission record, and retained partners at 90 days; partner-linked starts where partners report them.
Acceptance:
- Partners are counted only with written permission.
- Reported by type, with counts.
- No partner is counted because it linked to us once.
Depends on: [search, GEO and distribution](12-search-geo-distribution.md); BIZ-010.
Risks / not doing: implied endorsement. Never claim a partner endorses us without written permission ([R5 §4]).

### MET-027 · Partner-reported use (aggregate)
Priority P2 · Phase S3 · Status new · Pillars: TOGETHER
Why: partners see use we cannot see on the web.
What: partners report monthly how many activities they used, in aggregate. No resident, client or child data.
Acceptance:
- The form contains no person-level fields.
- Reported with the number of partners reporting.
Depends on: MET-026.
Risks / not doing: asking partners for personal data.

### MET-028 · Printable distribution and reprints
Priority P2 · Phase S2 · Status new · Pillars: all
Why: printing is a distribution path ([VISION.md]; [R5 §4]). Reprints show that a card is used more than once.
What: downloads of printable cards and packs; partner reprints where partners report them; QR-code visits counted as an aggregate through a short link.
Acceptance:
- No tracking beyond the aggregate.
- Each print carries its version (PLAT-007), so reprints can be matched to a version.
Depends on: PLAT-019.
Risks / not doing: counting downloads as use.

### Usability and evidence

### MET-029 · Usability study program
Priority P0 · Phase S1 · Status new · Pillars: all
Why: VISION asks for 8 to 15 usability sessions before content is expanded, and DESIGN §6 asks for assistive-technology users. The plan's measures are not yet run.
What: 8 to 15 sessions per stage, with a mix of assistive-technology users, caregivers and older participants. Each session records task success, the point where the person stopped, and their words. Fixes come before the next stage.
Acceptance:
- Sessions follow the [senior-first validation protocol](../senior-first/validation.md) and record consent.
- Each stage reports n, participant mix and tasks.
- No session data includes health information beyond what the person chooses to say, and none is stored in analytics.
Depends on: a recruitment route through partners or a research panel.
Risks / not doing: speed as a goal. Time to first usable instruction is a diagnostic, not a target.

### MET-030 · Comprehension test pass rate
Priority P1 · Phase S2 · Status new · Pillars: all
Why: the senior-first validation protocol uses a comprehension test. It should run on every new template.
What: share of participants who correctly say what an activity is, what they need and what to do first, in the five-second test ([validation](../senior-first/validation.md)).
Acceptance:
- Reported per template, with n.
- Templates that fail are redesigned before they are published widely.
Depends on: MET-029.
Risks / not doing: treating a pass as proof of usefulness. It is a readability check.

### MET-031 · Return households
Priority P1 · Phase S2 · Status new · Pillars: all
Why: "durable" and "return visits by households" are part of the definition of #1 ([README](README.md#definition-of-1-how-we-will-know)). [R4 §3] recommends collections over streaks, so the return measure must be optional and never framed as a streak.
What: share of households that return within 30 days, measured through a consented diary panel. The website cannot identify households without tracking, and it will not track them.
Acceptance:
- Panel recruitment is opt-in, and the panel has a stated size.
- Reported with n and the confidence range.
- No cookie-based return measure on the public site.
Depends on: consented diaries ([validation](../senior-first/validation.md)).
Risks / not doing: inferring return from GA4 user IDs. Not done.

### MET-032 · Outcome research program
Priority P1 · Phase S3 · Status new · Pillars: CALM, CARE, GROW
Why: [R3] and [R4 §5] show that outcome claims in this field outrun the evidence. Any outcome claim needs independent, pre-registered research.
What: a research program with a named partner: a pre-registered protocol, an agreed primary outcome, ethics approval, and publication whatever the result ([business model](16-business-model.md) BIZ-012).
Acceptance:
- Protocol registered before data collection.
- Results published, including null or negative results.
- No outcome claim on the site until a peer-reviewed result exists and a credentialed reviewer has checked the wording.
Depends on: BIZ-012; a research partner.
Risks / not doing: studies that test activities as treatments without a credentialed team ([R3 §4.2]).

### Counter-metrics and guardrails

### MET-033 · Caregiver wellbeing with a validated scale (partner-run)
Priority P3 · Phase S4 · Status new · Pillars: CARE
Why: caregiver strain is a real outcome for the CARE pillar, and a validated scale is the honest way to measure it if we ever try. Without a partner and ethics approval, any number would be marketing.
What: a validated caregiver wellbeing scale, chosen by the research partner, used in a study run under MET-032. Results are reported as study results, not as product metrics.
Acceptance:
- Ethics approval and a registered protocol before any data collection.
- Never presented as a therapy or clinical outcome.
- Results published whatever they show.
Depends on: MET-032; a research partner.
Risks / not doing: a homemade satisfaction question shown as an outcome. Not done.

### MET-034 · Time on site and page views (counter-metric)
Priority P0 · Phase S2 · Status new · Pillars: all
Why: VISION and the README say time on site and page views are diagnostics, not the goal. They can rise while mission success falls.
What: report time on site and page views as diagnostics. Trigger a review when they rise while confirmed starts fall.
Acceptance:
- Never listed as a headline result.
- The review trigger is written and checked monthly.
- A longer session is not a goal ([measurement plan](../../plan/measurement.md)).
Depends on: MET-001.
Risks / not doing: optimizing for time. Not done.

### MET-035 · Dark-pattern guardrails
Priority P0 · Phase S2 · Status new · Pillars: all
Why: DESIGN §9 and MISSION ban guilt notifications, streak shame and manipulative prompts. Guardrails must be measured, not just promised.
What: notification complaints; opt-out completion rate; time to unsubscribe from email; support messages about pressure or guilt; count of prompts that create urgency (target zero).
Acceptance:
- Reported monthly, with counts.
- Any complaint about pressure is reviewed within the same week.
- Opt-out is one step.
Depends on: [trust, safety, accessibility and privacy](14-trust-safety-accessibility-privacy.md).
Risks / not doing: hiding complaints in general support.

### MET-036 · Channel dependence
Priority P2 · Phase S3 · Status new · Pillars: all
Why: [R5 §2.5] and [R1 §7] warn that a single search channel is fragile. Diversified distribution is a resilience measure.
What: share of starts from the largest single channel (search, Pinterest, partners, app, direct) per quarter.
Acceptance:
- Reported quarterly, with the channel definitions.
- An alarm threshold is set after baseline.
Depends on: MET-001.
Risks / not doing: optimizing one channel at the expense of trust.

### Measurement design and operations

### MET-037 · Privacy-preserving measurement principles
Priority P0 · Phase S2 · Status new · Pillars: all
Why: MISSION sets privacy as a non-negotiable. The app has no analytics SDK by decision ([measurement plan](../../plan/measurement.md)). The website has GA4 only.
What: the design rules for every metric in this file: aggregate counts only; no health data, diagnosis or free text; no person-level data in public reports; minimum cell size (proposed: 10); retention set to the shortest useful period; consent respected (see [platform](15-platform-data-architecture.md) PLAT-026).
Acceptance:
- A one-page design note lists each metric, its data source, its retention and its cell-size rule.
- A reviewer checks the note before each new metric.
- Any metric that needs person-level data goes to the maintainer as a decision.
Depends on: PLAT-024, PLAT-026.
Risks / not doing: adding a metric that needs a new SDK without a decision ([measurement plan](../../plan/measurement.md)).

### MET-038 · Data-quality checks
Priority P1 · Phase S2 · Status new · Pillars: all
Why: a metric with no count or date is not evidence. The plan says every figure carries its count and date ([docs/plan/README.md](../../plan/README.md) §8).
What: automated checks for event schema failures, missing counts and dates on every report, consent-mode coverage, and sudden drops in event volume.
Acceptance:
- A failing check blocks the report until it is explained.
- Every report shows n and the date range.
Depends on: PLAT-024.
Risks / not doing: presenting noisy weekly numbers as trends. Read weeks, not days ([measurement plan](../../plan/measurement.md)).

### MET-039 · Dashboards and review cadence
Priority P0 · Phase S2 · Status new · Pillars: all
Why: metrics only change decisions when someone reviews them on a schedule.
What: three levels. Weekly ops (incidents, broken links, safety reports, overdue reviews). Monthly metrics review (MET-001 to MET-031). Quarterly evidence-gate review tied to [roadmap](18-roadmap.md). Each dashboard names its owner, its sources and its last update.
Acceptance:
- Each review has a written decision log.
- Gate decisions are recorded with the metrics used.
- Dashboards draw from GA4, Search Console, App Store Connect, Play Console and the pilot diary sheet; no third-party data broker.
Depends on: all of the above.
Risks / not doing: dashboards with no owner. Each one needs a name.

### MET-040 · Cost per confirmed start
Priority P1 · Phase S2 · Status new · Pillars: all
Why: VISION asks for "cost per verified useful activity". It keeps the mission honest about effort.
What: total editorial, review, translation and hosting cost in a period ÷ confirmed starts in the same period ([business model](16-business-model.md) BIZ-005).
Acceptance:
- Costs marked fact, estimate or unknown, as in the ledger.
- Reported quarterly with the period stated.
- The direction over time matters more than the level.
Depends on: BIZ-005; MET-001.
Risks / not doing: comparing across languages before costs per language are known.

---

## 3. Items at a glance

| ID | Metric | P | Phase | Status | Pillar |
|---|---|---|---|---|---|
| MET-001 | Confirmed activity starts | P0 | S1 | new | all |
| MET-002 | Start rate | P0 | S1 | new | all |
| MET-003 | Prints, saves, shares per 1,000 views | P1 | S1 | new | all |
| MET-004 | MAKE input | P1 | S1 | new | MAKE |
| MET-005 | GROW input | P2 | S3 | new | GROW |
| MET-006 | CARE input and "not a fit" reasons | P0 | S1 | new | CARE |
| MET-007 | CALM input and signposting views | P2 | S3 | new | CALM |
| MET-008 | PLAY input | P1 | S2 | new | PLAY |
| MET-009 | TOGETHER input | P2 | S2 | new | TOGETHER |
| MET-010 | Reviewed coverage | P0 | S1 | new | all |
| MET-011 | Overdue reviews | P1 | S2 | new | all |
| MET-012 | Translation coverage and staleness | P0 | S2 | new | all |
| MET-013 | Correction speed | P1 | S2 | new | all |
| MET-014 | Broken links and 404s | P1 | S1 | partial | all |
| MET-015 | Source coverage | P1 | S1 | new | CARE, CALM |
| MET-016 | Accessibility defects per release | P0 | S1 | partial | all |
| MET-017 | Assistive-technology task success | P0 | S1 | new | all |
| MET-018 | Safety reports and field completeness | P0 | S1 | partial | all |
| MET-019 | Claim-audit failures | P0 | S1 | partial | all |
| MET-020 | Print legibility pass rate | P1 | S1 | new | all |
| MET-021 | Non-branded impressions by cluster | P0 | S1 | new | all |
| MET-022 | Top-three share for task queries | P1 | S2 | new | all |
| MET-023 | Search share per cluster | P1 | S2 | new | all |
| MET-024 | Index coverage of indexed pairs | P1 | S1 | new | all |
| MET-025 | AI-answer citations | P2 | S3 | new | all |
| MET-026 | Partner adoption | P1 | S2 | new | TOGETHER |
| MET-027 | Partner-reported use | P2 | S3 | new | TOGETHER |
| MET-028 | Printable distribution and reprints | P2 | S2 | new | all |
| MET-029 | Usability study program | P0 | S1 | new | all |
| MET-030 | Comprehension pass rate | P1 | S1 | new | all |
| MET-031 | Return households | P1 | S2 | new | all |
| MET-032 | Outcome research program | P1 | S3 | new | CALM, CARE, GROW |
| MET-033 | Caregiver wellbeing with a validated scale | P3 | S4 | new | CARE |
| MET-034 | Time on site (counter-metric) | P0 | S1 | new | all |
| MET-035 | Dark-pattern guardrails | P0 | S1 | new | all |
| MET-036 | Channel dependence | P2 | S3 | new | all |
| MET-037 | Privacy-preserving measurement principles | P0 | S1 | new | all |
| MET-038 | Data-quality checks | P1 | S1 | new | all |
| MET-039 | Dashboards and review cadence | P0 | S1 | new | all |
| MET-040 | Cost per confirmed start | P1 | S2 | new | all |

Counts: 40 items. P0 15 (001, 002, 006, 010, 012, 016, 017, 018, 019, 021, 029, 034, 035, 037, 039). P1 17. P2 7 (005, 007, 009, 025, 027, 028, 036). P3 1 (033).

## Open questions

1. **Baselines.** Which three-month windows set the baselines for MET-002, MET-021 and MET-014, given the store and search data are still thin?
2. **Minimum cell size.** Is 10 the right suppression threshold for public reports (MET-001, MET-037)?
3. **Search Console and Bing.** The plan lists verification as an open item. Until it is done, MET-021 and MET-024 cannot be measured.
4. **Panel for return households.** Who runs the consented diary panel (MET-031), and how is it recruited without an account?
5. **Cost data.** The cost ledger (BIZ-005) must exist before MET-040 can be reported.
6. **Safety reporting.** Which channel receives harm and near-miss reports (MET-018), and who reviews them out of hours?
7. **Research partner.** Which university or institute is the first partner for MET-032, and what is its ethics route?
