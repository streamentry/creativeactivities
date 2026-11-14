# Roadmap: phases S1 to S4, evidence gates and sequencing

Status: proposal, 2026-11-14. It turns the index of 533 items into a sequence. It does not claim that any item is built, validated or approved. Binding inputs: [VISION](../../../VISION.md) ("Product stages with evidence gates" and the decision rule), [MISSION](../../../MISSION.md), [DESIGN](../../../DESIGN.md), and the [README](README.md) baseline.

Read with: [17 metrics and evidence](17-metrics-and-evidence.md) (gate measures), [06 content library](06-content-library.md) section 6 (targets by phase), [13 localization](13-localization.md) (language gates), [02 information architecture](02-information-architecture.md) (hub threshold H3), and [phase-overrides.tsv](phase-overrides.tsv) (every priority and phase change against [id-index.tsv](id-index.tsv)).

How to read the numbers: this file uses the index with the overrides applied. After overrides the phase counts are S1 40, S2 407, S3 75, S4 11. S2 is large on purpose: it is the menu the S2 gate filters, not a commitment to build all of it. Only S1 has a hard cap (40 items).

## 1. Purpose, and how phases map to VISION

| Phase | VISION stage | What it is for | It ends when |
|---|---|---|---|
| **S1** | Stage 1, "small, excellent library" (days 15 to 60). Stage 0 evidence (days 1 to 14) is a prerequisite. | Three differentiated hubs, 20 original pages with real illustrations or photos, print styles, bylines, mobile performance, a tiny finder, 8 to 15 usability sessions, privacy-conscious events. | The S1 gate passes (section 3). |
| **S2** | Stage 2, "prove repeat usefulness" (days 61 to 90) | Add only what search and feedback justify; test a follow-up and one printable pack; first MAKE and CARE expansion; CALM under strict wording rules. | Each segment passes its scale gate, or is paused or killed. |
| **S3** | Stage 3, "expand by adjacency, not by enthusiasm" | New audiences with their own search-gap and usability evidence: child-facing GROW content, educators, referrers, adjacent clusters. | Each audience passes its own gate. |
| **S4** | No VISION stage. The VISION decision rule ("earn global coverage one validated query cluster at a time") applied to languages and clusters at scale. | Launched languages with reviewers, each with its own clusters. | Per language and cluster (section 3). |

**Rule.** A pillar or a language advances only when its gate passes, on evidence recorded in [17](17-metrics-and-evidence.md). Passing opens that pillar's or language's items in the next phase. It does not open other pillars. Failing pauses it (section 6).

**Priority is not phase.** P0 means "must be true before the gate of this phase opens". A P0 in S2 is required to pass the S2 gate. It is not required to ship in S1. Priorities were kept from the writers' files, except the 62 items that had none.

**Stage 0 is assumed, not re-run.** S1 needs the Stage 0 record (keyword export, SERP review, 10 caregiver interviews). SEO-002 replaces the current wrong-market demand data. If that record does not exist, the S1 hubs are not yet justified.

**Live content is not S1 work.** Items with status `exists` that are outside the S1 list stay live. They are maintained under the S1 quality gates and get no new build work until their phase opens. This is why the 12 games and the crafts pillar move to S2 without being removed.

## 2. S1 commit list (40 items)

**What S1 must prove** (VISION Stage 1): three differentiated hubs (dementia, seated, bedside), 20 original pages with illustrations or photos, adaptations, print styles, bylines, mobile performance, a tiny finder, 8 to 15 usability sessions, and privacy-conscious events. **What S1 adds on top** is the non-negotiable trust, safety, accessibility and privacy set from [14](14-trust-safety-accessibility-privacy.md), and the measures that the S1 gate needs.

**Selection.** The baseline already has 38 cards, 4 hubs, 88 guides, 12 games and 2 packs. S1 therefore funds images, print, hubs, trust and measurement, not new volume. The 20-page target can be met from the existing 38 cards once WEB-012 adds process images and TSA-038 clears their rights.

**What S1 deliberately excludes:** new CARE cards (CNT-901 to CNT-911, except the review of four dementia guides inside SEO-009), CALM, GROW, all MAKE expansion, new games, app features beyond what is live, community features, partner program, languages beyond the English library, and any account, payment or subscription. WEB-059 (formal hub template) moves to S2 because the two new hubs are built on the template inside SEO-009 and SEO-010.

**Risks inside the list.** (a) SEO-009 can ship as an indexable hub only if at least eight cards meet its rule (H3). If it cannot, the S1 gate needs a maintainer decision (hold, or accept two hubs). (b) WEB-011 offers "Save", which uses the browser-saved list that is already live. The data-control item WEB-029 is the first S2 item to pull forward. (c) GA4 is live today; WEB-025 and PLAT-024 must settle what GA4 may send before the S1 gate (open decision 1).

| ID | Title | Status | Why in S1 | Depends on |
|---|---|---|---|---|
| WEB-001 | Activity finder | exists | Tiny finder: time, materials, energy, who is taking part; no diagnosis field | CNT-001 |
| CNT-001 | Activity card (canonical) | exists | Activity card (canonical): the unit of S1; each original page is one card | TSA-034, TSA-038 |
| CNT-002 | Variation | exists | Variation: adaptations (seated, bedside, low-vision, nonverbal, less-sensory) are the differentiator | CNT-001 |
| CNT-003 | Search hub | exists | Search hub template: bedside hub already live; template reused for the two new hubs | SEO-001, SEO-003 |
| WEB-035 | Large text, high contrast and reduced motion | exists | Large text, high contrast and reduced motion: older and dementia-adjacent users from day one | TSA-001 |
| WEB-024 | It's fine to stop and "not today" | exists | "It's fine to stop" and "not today": the no-pressure rule on every card | none |
| WEB-055 | Family photos stay on the device | exists | Family photos stay on the device: no upload in the S1 web library | none |
| WEB-056 | Structured data that matches visible content | exists | Structured data matches visible content: no schema claims the page does not show | none (policy in SEO-013, S2) |
| BIZ-001 | Free core, forever | exists | Free core, forever: every S1 card and printable stays free and login-free | none |
| BIZ-002 | No ads inside activities, games or child-directed pages | exists | No ads inside activities or child-directed pages; CSP already blocks ad domains | TSA-019 (S2 child-page rule) |
| BIZ-003 | No sale or sharing of personal or health data | exists | No sale or sharing of personal or health data | PLAT-026 (consent and GPC, S2); policy holds until then |
| WEB-012 | Step photos or illustrations | new | Step photos or illustrations: VISION asks for the actual process shown; biggest quality gap | TSA-038, CNT-031 |
| WEB-014 | One-page printable card | partial | One-page printable card: print is a VISION S1 requirement and the share unit | WEB-012, WEB-011 |
| WEB-011 | At-a-glance block with Start, Print and Save | partial | At-a-glance block with Start, Print and Save: time, setup and materials before scrolling | WEB-025, WEB-014 |
| WEB-057 | Byline and reviewer block | partial | Byline and reviewer block: named author, review status, date; "not yet reviewed" shown honestly | TSA-034 |
| WEB-025 | We tried this | new | "We tried this": the north-star proxy (MET-001), with no account and no health field | PLAT-024, TSA-012 |
| WEB-026 | This didn't fit | new | "This didn't fit": not-fit feedback that drives the next recommendation | PLAT-024 |
| SEO-009 | Dementia activities hub | new | Dementia activities hub: VISION hub 1 and the wedge cluster; indexable only if H3 passes | TSA-034 (named reviewer), SEO-001, H3 |
| SEO-010 | Seated activities hub | new | Seated activities hub: VISION hub 2 (seated and bedside wedge) | SEO-001, SEO-003 |
| SEO-001 | Cluster map from the R5 ranking | partial | Cluster map from the R5 ranking: chooses the three S1 hubs | SEO-002 |
| SEO-002 | Replace the wrong-market demand data | new | Replace the wrong-market demand data: Stage 0 evidence for one market | none (US-English Keyword Planner export) |
| SEO-003 | One URL contract | new | One URL contract: three documents disagree on hub and activity paths | open decision 4 |
| SEO-004 | Search consoles and a measurement baseline | partial | Search consoles and a measurement baseline: needed for the S1 gate and MET-021 | domain verification (17, open question 3) |
| WEB-036 | Keyboard, focus and screen reader on every template | partial | Keyboard, focus and screen reader on every template: WCAG 2.2 AA on S1 surfaces | TSA-001 |
| WEB-074 | Performance budget | partial | Performance budget: VISION asks for working mobile performance on basic phones | PLAT-036 |
| TSA-001 | WCAG 2.2 AA as the release gate | partial | WCAG 2.2 AA as the release gate for all S1 work | none |
| TSA-002 | Testing with assistive-technology users | new | Testing with assistive-technology users: automated checks are necessary and insufficient | MET-029 (recruitment) |
| MET-029 | Usability study program | new | Usability study program: 8 to 15 sessions before expansion (VISION Stage 1) | TSA-002 |
| PLAT-024 | Website event dictionary and payload rules | partial | Website event dictionary and payload rules: the privacy-conscious events VISION asks for | open decision 1 (GA4) |
| TSA-012 | Event allowlist and no health data | new | Event allowlist and no health data: enforces PLAT-024; no health detail in analytics | PLAT-024 |
| WEB-022 | Structured safety flags | partial | Structured safety flags: materials, supervision and food-as-material risk shown consistently | TSA-023 and TSA-024 (S2 vocabulary and rules) |
| WEB-060 | Art-therapy boundary page | new | Art-therapy boundary page: existing copy uses "therapeutic" and therapy-adjacent guides | TSA-028 |
| WEB-061 | Crisis-safe route | new | Crisis-safe route on pages that invite disclosure; UK, Ireland and US verified | CNT-1003 (country list), L10N-009 (owner) |
| WEB-062 | Translation status and no-index for unreviewed copies | partial | Translation status and no-index for unreviewed copies: 189 machine-translated locale codes | L10N-033 (decision), L10N-020 |
| TSA-035 | Corrections route and log | new | Corrections route and log: wrong information needs a visible fix path | TSA-045, response targets (open decision 12) |
| TSA-028 | Claims vocabulary and banned words | new | Claims vocabulary and banned words: stops therapy, cure and cognitive claims; drives the CNT-909 title fix | TSA-031, L10N-007 |
| TSA-034 | Credentialed review scope record | new | Credentialed review scope record: what each reviewer checked; required for the dementia hub | named reviewers (open decision 8) |
| TSA-038 | Image rights and consent log | new | Image rights and consent log: every S1 photo or illustration has a record; child flag | PLAT-003 (S2 media records) |
| TSA-045 | Response to an unsafe or wrong activity | new | Response to an unsafe or wrong activity: stop-and-withdraw path before traffic grows | TSA-035, response targets (open decision 12) |
| TSA-018 | Child-reachable default | new | Child-reachable default: S1 has no child data and no child-directed design | TSA-019, TSA-020 (S2) |

## 3. Phases S2, S3 and S4: goals, gates and items

### S2: prove repeat usefulness

**Goal.** Show that people return, and that an activity starts after a visit. Add one printable pack, one follow-up path (no push pressure), the first MAKE and CARE expansion, and CALM only under the wording rules in section 4.

**Entry gate (the S1 gate). All of these, measured on evidence:**
1. **Usability.** At least 8 sessions (VISION: 8 to 15) on the three S1 hubs and at least five cards, with screen-reader, keyboard or switch, low-vision and older-adult participants ([TSA-002](14-trust-safety-accessibility-privacy.md), MET-029). Proposed pass: most participants (proposal: at least 6 of 8) find and start a suitable card unaided, each recorded with task, completion and time to start.
2. **No open critical findings.** Zero open critical accessibility or safety findings (MET-016, MET-018). A critical finding blocks the gate until it is fixed and retested.
3. **Claims and reviews.** Zero claim-audit failures on S1 pages (MET-019). Every S1 page shows author and review status (WEB-057). The dementia hub is indexable only with a named credentialed reviewer on record (TSA-034). Otherwise it is held.
4. **Measurement.** Search Console is verified (SEO-004) and a three-month baseline exists for MET-002, MET-014 and MET-021 ([17](17-metrics-and-evidence.md), open question 1). Thresholds are set from that baseline. Nothing is set before it.
5. **Search signal.** After the baseline, non-branded impressions for each S1 cluster rise over two consecutive four-week periods against that baseline (VISION: "begin to grow").
6. **Events and privacy.** Confirmed starts (MET-001) are recorded only through the event allowlist (TSA-012). An audit finds no health field in analytics.
7. **Hub rule.** Each live hub meets H3 (at least eight qualifying cards, at least three that differ in setting, group size or adaptation) or is `noindex` and linked from its parent ([02](02-information-architecture.md)).

**Timing.** The search baseline needs about three months of data. The earliest honest S2 scale decision is therefore about three months after S1 measurement starts. The gate cannot be passed faster by spending more.

#### Website (03)

| ID | P | Status | Title |
|---|---|---|---|
| WEB-002 | P1 | new | Describe your situation |
| WEB-003 | P1 | new | Site search with care and family language |
| WEB-004 | P1 | partial | Why it fits, and a lower-effort option |
| WEB-005 | P1 | new | Finder state in the URL |
| WEB-006 | P1 | new | What I have mode |
| WEB-007 | P2 | new | One idea right now |
| WEB-008 | P1 | partial | Related cards by function |
| WEB-009 | P1 | new | Pillar tiles and pillar hubs |
| WEB-010 | P1 | ? | Facet browse pages |
| WEB-013 | P1 | partial | Variation chips with an in-page switch |
| WEB-015 | P0 | partial | No-ink, no-URL print version |
| WEB-016 | P0 | new | Versioned prints |
| WEB-017 | P1 | new | Printable pack builder |
| WEB-018 | P1 | new | Large-print editions |
| WEB-019 | P1 | new | Picture-led card |
| WEB-020 | P1 | new | Read-aloud |
| WEB-023 | P0 | partial | Scope line on every page |
| WEB-027 | P1 | new | Card changelog |
| WEB-028 | P1 | partial | Saved collections on the device |
| WEB-029 | P0 | new | Data control on the device |
| WEB-031 | P1 | partial | Weekly plan, printable |
| WEB-032 | P1 | new | Paths |
| WEB-033 | P2 | ? | Seasonal hubs and a "this season" calendar |
| WEB-034 | P1 | new | Occasion hubs |
| WEB-037 | P0 | partial | Zoom and small-screen reflow |
| WEB-038 | P0 | partial | Works without JavaScript, within a page budget |
| WEB-039 | P1 | new | Plain-language mode |
| WEB-040 | P1 | new | Offline reading |
| WEB-042 | P2 | ? | Display options: dark theme and reading settings |
| WEB-044 | P1 | partial | Partner page with permission rules |
| WEB-045 | P1 | new | Care-home weekly program sheet |
| WEB-046 | P1 | new | Group mode for facilitators |
| WEB-050 | P1 | new | Share a card |
| WEB-051 | P1 | partial | Games filters |
| WEB-052 | P1 | new | Printable partner on each game page |
| WEB-053 | P1 | new | Difficulty without scores |
| WEB-054 | P0 | new | Stop and rest on every game |
| WEB-058 | P0 | new | Report a problem |
| WEB-059 | P0 | partial | Intent hub template |
| WEB-063 | P1 | exists | Sitemaps, IndexNow and llms.txt |
| WEB-064 | P1 | partial | Answer-first summaries |
| WEB-065 | P1 | partial | Printables index |
| WEB-067 | P2 | ? | Today quick answers |
| WEB-068 | P0 | partial | Privacy-minimal analytics |
| WEB-069 | P0 | partial | No ads, no third-party embeds, and a cookie rule |
| WEB-070 | P0 | new | Notification policy |
| WEB-071 | P1 | new | Email digest, opt-in only |
| WEB-072 | P0 | new | Child-facing pages rule |
| WEB-073 | P0 | new | Image consent and rights log |
| WEB-075 | P0 | partial | Accessibility tests in CI |
| WEB-076 | P1 | new | Due-for-review queue |

#### App (04)

| ID | P | Status | Title |
|---|---|---|---|
| APP-014 | P0 | new | App-to-website handoff: every activity links to its full guide |
| APP-018 | P0 | partial | Screen-reader-first activity reading |
| APP-019 | P0 | new | First run asks for nothing |
| APP-001 | P1 | new | Offline activity cards (bundled subset) |
| APP-002 | P1 | new | Print an activity card or pack from the app |
| APP-003 | P1 | new | Personal activity plan on the device |
| APP-004 | P1 | new | On-device "We tried this" list |
| APP-005 | P1 | new | Offline finder with the website filters |
| APP-006 | P1 | new | Helper mode on one device |
| APP-013 | P1 | new | Website-to-app link for offline use |
| APP-011 | P1 | new | Home-screen quick actions |
| APP-020 | P1 | new | Share an activity as text and a link |
| APP-026 | P1 | partial | Content changes only through app releases |
| APP-029 | P1 | new | Facilitator page for each card |
| APP-030 | P1 | new | I have this materials checklist |
| APP-031 | P1 | new | Picture-only card view |
| APP-034 | P1 | new | Experiment gates |
| APP-010 | P2 | new | Home-screen widget |
| APP-021 | P2 | new | Memory card image |
| APP-022 | P2 | new | Bedside mode |
| APP-023 | P2 | new | Optional haptics |
| APP-024 | P3 | partial | Dark theme after contrast check |
| APP-028 | P2 | new | One-switch and keyboard play |

#### Games (05)

| ID | P | Status | Title |
|---|---|---|---|
| GAME-001 | P0 | exists | Picture pairs |
| GAME-002 | P0 | exists | Find the same |
| GAME-003 | P1 | exists | Shadow match |
| GAME-013 | P0 | exists | Visible picture matching (app) |
| GAME-014 | P2 | exists | Hidden picture matching (app) |
| GAME-018 | P1 | new | Odd one out |
| GAME-020 | P2 | new | Color match |
| GAME-021 | P2 | new | Halves match |
| GAME-006 | P1 | exists | Finish the saying |
| GAME-007 | P1 | exists | Large-print word search |
| GAME-022 | P1 | new | Four together |
| GAME-025 | P1 | new | Story dice |
| GAME-026 | P2 | new | Sound loop maker |
| GAME-027 | P2 | new | Keep the beat |
| GAME-029 | P1 | new | Singing sheets |
| GAME-008 | P0 | exists | Coloring |
| GAME-031 | P1 | new | Paint-by-number lite |
| GAME-032 | P1 | new | Two-hand drawing duet |
| GAME-033 | P2 | new | Collage board |
| GAME-034 | P2 | new | Pattern maker |
| GAME-035 | P2 | new | Co-decorate a card |
| GAME-037 | P2 | new | Scrapbook builder |
| GAME-012 | P1 | exists | Calm breathing |
| GAME-038 | P2 | new | Color wash |
| GAME-039 | P3 | new | Quiet scene |
| GAME-040 | P1 | new | Seasonal puzzle pack |
| GAME-041 | P2 | new | Garden planner |
| GAME-042 | P2 | new | Garden bird spotter |
| GAME-043 | P2 | new | Picnic planner |
| GAME-009 | P0 | exists | Conversation cards |
| GAME-010 | P0 | exists | Photo pairs |
| GAME-044 | P1 | new | Reminiscence card match |
| GAME-046 | P1 | new | Story chain |
| GAME-047 | P2 | new | Find together |
| GAME-048 | P2 | new | Build-it-together grid |
| GAME-049 | P2 | new | Seated toss tally |
| GAME-011 | P0 | exists | Picture bingo |
| GAME-050 | P1 | new | Picture passing circle |
| GAME-051 | P1 | new | Big-screen picture talk |
| GAME-052 | P2 | new | Group coloring wall |
| GAME-004 | P1 | exists | Sort together |
| GAME-005 | P1 | exists | Picture puzzle (web) |
| GAME-015 | P1 | partial | Picture puzzle (app) |
| GAME-016 | P2 | new | Tap-to-place puzzle (app) |
| GAME-017 | P2 | new | Picture sorting (app) |
| GAME-019 | P1 | new | Large-target sort |
| GAME-058 | P2 | new | Jigsaw from your photo |
| GAME-059 | P1 | new | Spot the difference |
| GAME-060 | P3 | new | Quiet shapes puzzle |
| GAME-061 | P1 | new | Daily shared card |

#### Content library (06)

| ID | P | Status | Title |
|---|---|---|---|
| CNT-004 | P1 | exists | Guide |
| CNT-005 | P1 | exists | Printable pack |
| CNT-006 | P1 | new | Path (weekly plan or multi-week sequence) |
| CNT-007 | P1 | partial | Printable template |
| CNT-008 | P2 | partial | Coloring page |
| CNT-009 | P1 | new | Step photos and illustrations |
| CNT-010 | P2 | new | Short video |
| CNT-011 | P2 | new | Audio read-aloud |
| CNT-012 | P1 | new | Glossary |
| CNT-013 | P2 | new | Seasonal calendar and collections |
| CNT-014 | P2 | new | Educator and care-setting program |
| CNT-015 | P1 | exists | FAQ |
| CNT-030 | P0 | new | Editorial pipeline |
| CNT-031 | P0 | new | Media rights and provenance |
| CNT-032 | P0 | new | AI-assistance policy |
| CNT-033 | P1 | new | Target library sizes |
| CNT-034 | P1 | new | Update, correction and retirement |
| CNT-040 | P0 | new | Library inventory |

#### MAKE: crafting (07)

| ID | P | Status | Title |
|---|---|---|---|
| CNT-701 | P1 | exists | Paper |
| CNT-702 | P1 | exists | Painting |
| CNT-703 | P1 | exists | Drawing |
| CNT-704 | P1 | exists | Collage |
| CNT-705 | P1 | exists | Clay and dough |
| CNT-706 | P1 | exists | Textiles, yarn, sewing and knitting |
| CNT-707 | P1 | exists | Nature crafts |
| CNT-708 | P2 | exists | Printmaking |
| CNT-709 | P1 | exists | Recycled and upcycled |
| CNT-710 | P1 | exists | Card-making |
| CNT-712 | P2 | exists | Woodless simple construction |
| CNT-713 | P1 | exists | Seasonal and holiday, across cultures |
| CNT-714 | P2 | exists | Photography and phone crafts |
| CNT-715 | P2 | exists | Writing and bookmaking |
| CNT-716 | P2 | exists | Music-making with household items |

#### GROW: parenting and kids (08)

| ID | P | Status | Title |
|---|---|---|---|
| CNT-801 | P0 | ? | Age bands and choking rule |
| CNT-850 | P0 | ? | Safety rules for GROW |
| CNT-870 | P1 | ? | Intergenerational and remote versions |
| CNT-880 | P0 | ? | Privacy and design constraints |

#### CARE: older adults and dementia (09)

| ID | P | Status | Title |
|---|---|---|---|
| CNT-930 | P0 | ? | Home, with family |
| CNT-931 | P1 | ? | Living alone |
| CNT-932 | P1 | ? | Care home |
| CNT-933 | P1 | ? | Hospital and bedside |
| CNT-934 | P2 | ? | Day center |
| CNT-935 | P1 | ? | Remote family |
| CNT-920 | P1 | ? | Reminiscence (non-quiz) |
| CNT-921 | P1 | ? | Music |
| CNT-922 | P2 | ? | Nature |
| CNT-923 | P2 | ? | Household tasks with purpose |
| CNT-924 | P1 | ? | Art (adult, seated) |
| CNT-925 | P1 | ? | Sensory |
| CNT-926 | P2 | ? | Faith and culture |
| CNT-927 | P2 | ? | Movement |
| CNT-928 | P1 | ? | Conversation |
| CNT-901 | P0 | ? | 1 |
| CNT-902 | P1 | ? | 2 |
| CNT-903 | P0 | ? | 3 |
| CNT-904 | P1 | ? | 4 |
| CNT-905 | P1 | ? | 5 |
| CNT-906 | P2 | ? | 6 |
| CNT-907 | P0 | new | 7 |
| CNT-908 | P1 | ? | 8 |
| CNT-909 | P0 | new | 9 |
| CNT-910 | P1 | ? | 10 |
| CNT-911 | P2 | ? | 11 |

#### CALM: creative wellbeing (10)

| ID | P | Status | Title |
|---|---|---|---|
| CNT-1010 | P2 | ? | Calm drawing and doodling |
| CNT-1011 | P2 | ? | Coloring |
| CNT-1012 | P2 | ? | Collage |
| CNT-1013 | P2 | ? | Journaling (non-disclosure) |
| CNT-1014 | P2 | ? | Music for mood |
| CNT-1015 | P2 | ? | Nature art |
| CNT-1016 | P2 | ? | Gratitude crafts |
| CNT-1017 | P2 | ? | Grief and remembrance making |
| CNT-1018 | P2 | ? | Stress-relief making |
| CNT-1019 | P2 | ? | Creative routines |
| CNT-1000 | P0 | new | Art-therapy boundary policy |
| CNT-1001 | P0 | new | Claim register and phrasing rules |
| CNT-1002 | P0 | new | Trauma-informed defaults |
| CNT-1003 | P0 | partial | Crisis route by country (UK, Ireland, US checked; others unverified) |
| CNT-1004 | P0 | new | Reviewer roles and review record |
| CNT-1020 | P1 | new | Referral guides |

#### Community and UGC (11)

| ID | P | Status | Title |
|---|---|---|---|
| COM-001 | P0 | new | We tried this tap (no account) |
| COM-002 | P1 | new | Project note: "What we made" |
| COM-003 | P1 | new | Photo of a make |
| COM-004 | P1 | new | What worked for us adaptation tips |
| COM-005 | P1 | new | Variations submitted for editorial review |
| COM-006 | P0 | new | Fit reports (no stars) |
| COM-007 | P1 | new | Filter by fit |
| COM-008 | P1 | new | Moderated questions with editorial answers |
| COM-009 | P0 | new | Moderation pipeline (pre-moderation) |
| COM-010 | P0 | new | Reporting, takedown and escalation |
| COM-011 | P1 | new | Appeals |
| COM-012 | P0 | new | Anti-spam, rate limits and bot control |
| COM-017 | P1 | new | Optional face blur |
| COM-018 | P0 | new | Alt text for every photo |
| COM-033 | P1 | new | Moderator training and welfare |
| COM-013 | P0 | new | Minimal data and display names |
| COM-014 | P0 | new | Children: no child images, no child contributors |
| COM-015 | P0 | new | Consent for people pictured |
| COM-016 | P0 | new | Image processing: EXIF stripped, resized, stored safely |
| COM-029 | P0 | new | Edit, delete and export my contributions |
| COM-030 | P0 | new | Accessible community features |
| COM-019 | P0 | new | Contributor credit and license |
| COM-020 | P0 | new | Contributor guidelines and claim rules |
| COM-021 | P1 | new | Editorial review queue and roles |
| COM-031 | P0 | new | Suggest a correction on every activity |
| COM-024 | P2 | new | My made list (private, on the device) |
| COM-025 | P2 | new | Made together printable card with credit |
| COM-028 | P2 | new | Email digest of new activities (opt-in) |
| COM-034 | P1 | new | Community quality metrics |

#### Search, GEO and distribution (12)

| ID | P | Status | Title |
|---|---|---|---|
| SEO-005 | P0 | new | Migrate from the old domain and old host |
| SEO-006 | P0 | partial | Page-type rules and the canonical activity |
| SEO-007 | P0 | new | No thin or programmatic pages |
| SEO-008 | P0 | partial | Intent ownership map |
| SEO-011 | P0 | partial | Answer block on every activity and hub |
| SEO-012 | P0 | partial | Bylines, reviewers and dates |
| SEO-013 | P0 | partial | Structured data policy |
| SEO-014 | P0 | partial | Internal linking graph |
| SEO-015 | P0 | new | Duplicate and near-duplicate audit |
| SEO-016 | P1 | new | Reminiscence hub (non-clinical) |
| SEO-017 | P1 | new | Crafts for limited hand strength or arthritis |
| SEO-018 | P1 | partial | Grandparent and grandchild expansion |
| SEO-019 | P1 | new | Measure AI discovery and citations |
| SEO-020 | P1 | partial | Referral and app attribution |
| SEO-021 | P1 | partial | Web-to-app bridge test |
| SEO-022 | P1 | partial | Printable card as a link and share asset |
| SEO-023 | P1 | new | YouTube Shorts demonstrations |
| SEO-024 | P1 | new | Pinterest pins |
| SEO-025 | P1 | partial | Partner distribution |
| SEO-026 | P1 | new | Opt-in email digest |
| SEO-027 | P1 | partial | Earned links through usefulness |
| SEO-028 | P1 | partial | Core Web Vitals and performance budgets |
| SEO-029 | P1 | partial | Canonical and parameter policy |
| SEO-030 | P1 | partial | Locale indexing gate |
| SEO-031 | P1 | new | Hreflang implementation |
| SEO-032 | P1 | partial | Local search phrase research |
| SEO-033 | P1 | partial | App store optimization per locale |
| SEO-034 | P1 | exists | llms.txt kept accurate |
| SEO-035 | P1 | new | AI crawler policy |
| SEO-036 | P2 | new | Holiday and seasonal pages (R5 rank 6) |
| SEO-037 | P2 | new | Music activities for seniors (R5 rank 10) |
| SEO-042 | P2 | partial | FAQPage on visible questions |
| SEO-043 | P2 | partial | ItemList on curated collections |
| SEO-044 | P2 | new | VideoObject on real videos |
| SEO-045 | P2 | new | Open activity packs with a license |
| SEO-047 | P1 | partial | HowTo markup on step pages |

#### Localization (13)

| ID | P | Status | Title |
|---|---|---|---|
| L10N-001 | P0 | partial | Current-state inventory and count reconciliation |
| L10N-002 | P0 | partial | Launch order and evidence gates |
| L10N-003 | P0 | partial | Native review workflow |
| L10N-004 | P0 | new | Reviewer recruitment and credentials |
| L10N-005 | P0 | new | Content that is never published by machine alone |
| L10N-006 | P0 | new | Structure survives translation |
| L10N-007 | P0 | new | Dementia terminology glossary per locale |
| L10N-008 | P0 | new | Brand-name propagation check |
| L10N-009 | P0 | new | Local safety and crisis information |
| L10N-010 | P0 | partial | Translation memory, term base and ARB extraction |
| L10N-011 | P0 | new | Activity cards localized before guides |
| L10N-012 | P1 | new | Cultural adaptation register |
| L10N-013 | P1 | new | Holidays, faith and food defaults |
| L10N-014 | P1 | new | Units, paper sizes and printing |
| L10N-015 | P1 | new | Family structures and forms of address |
| L10N-016 | P1 | partial | Right-to-left layout |
| L10N-017 | P1 | partial | Scripts and font coverage |
| L10N-018 | P1 | new | Text length and 200% layout per language |
| L10N-019 | P1 | partial | Store localization mechanics |
| L10N-020 | P1 | partial | Indexing and hreflang only for reviewed locales |
| L10N-021 | P1 | new | Stale translations after English changes |
| L10N-022 | P1 | partial | Mainland China exclusion |
| L10N-023 | P1 | partial | Accessibility in each language |
| L10N-024 | P1 | partial | Review budget and cost estimate |
| L10N-025 | P1 | new | Defect tracking and quality metrics |
| L10N-026 | P1 | partial | Local search phrases as hypotheses |
| L10N-027 | P2 | new | Imagery and people across cultures |
| L10N-032 | P2 | partial | Quiz and activity local swaps |
| L10N-033 | P0 | new | Index decision for the top-50 expansion |

#### Trust, safety, accessibility, privacy (14)

| ID | P | Status | Title |
|---|---|---|---|
| TSA-003 | P0 | partial | Zoom, reflow, motion and timing |
| TSA-004 | P0 | partial | Keyboard, focus and drag alternatives |
| TSA-005 | P1 | partial | Color, contrast and text alternatives |
| TSA-006 | P1 | new | Flashing and motion in games |
| TSA-007 | P1 | new | Accessibility statement and feedback route |
| TSA-008 | P1 | new | Plain-language standard |
| TSA-009 | P1 | new | Accessibility regression tests in CI |
| TSA-010 | P0 | partial | No accounts for the core product |
| TSA-011 | P0 | new | Data and tracker inventory |
| TSA-013 | P0 | new | Special-category data posture (GDPR Article 9) |
| TSA-014 | P1 | new | Consent for non-essential storage |
| TSA-015 | P0 | partial | Photos stay on the device |
| TSA-016 | P1 | new | Retention, deletion and data requests |
| TSA-017 | P1 | new | Privacy notice and store privacy labels |
| TSA-019 | P0 | new | No ads or ad technology on child-reachable pages |
| TSA-020 | P0 | new | UK Age Appropriate Design Code assessment |
| TSA-021 | P0 | new | Children in media |
| TSA-022 | P1 | new | Parenting content boundaries |
| TSA-023 | P0 | partial | Standard safety vocabulary and fields |
| TSA-024 | P0 | new | Supervision and food-as-material rules |
| TSA-025 | P1 | partial | Stop-and-switch note |
| TSA-026 | P1 | partial | Scope statement on each card |
| TSA-027 | P0 | new | Crisis route on activities that invite disclosure |
| TSA-029 | P0 | new | No cognitive or brain-training outcome claims |
| TSA-030 | P0 | new | Art therapy boundary |
| TSA-031 | P1 | partial | Evidence labels next to benefit sentences |
| TSA-032 | P1 | new | Store, partner and marketing copy under the same policy |
| TSA-033 | P0 | partial | Editorial policy and roles |
| TSA-036 | P1 | new | Review cadence |
| TSA-037 | P1 | new | AI-assistance disclosure |
| TSA-039 | P1 | new | Moderation and review integrity for user content |
| TSA-040 | P1 | new | Platform law check for user content |
| TSA-041 | P0 | partial | Security headers and content security policy |
| TSA-042 | P1 | new | Third-party scripts, fonts and subresource integrity |
| TSA-043 | P1 | new | Secrets and dependencies |
| TSA-044 | P1 | new | Forms: anti-abuse without heavy CAPTCHA |
| TSA-046 | P0 | new | Privacy and security breach process |
| TSA-047 | P1 | new | Safety report route |
| TSA-048 | P0 | partial | Transparency pages set |
| TSA-049 | P1 | new | Sponsorship and partner disclosure |

#### Platform and data (15)

| ID | P | Status | Title |
|---|---|---|---|
| PLAT-001 | P0 | partial | Stable entity IDs separate from slugs |
| PLAT-002 | P1 | new | Variations as first-class records |
| PLAT-003 | P0 | new | Media asset records and rights log |
| PLAT-004 | P0 | partial | Translation records with source hashes |
| PLAT-005 | P0 | partial | Review records that cannot be faked |
| PLAT-006 | P1 | partial | Source records and claim links |
| PLAT-007 | P1 | new | Versions, change log and corrections |
| PLAT-008 | P1 | partial | URL policy, redirects and canonical registry |
| PLAT-009 | P0 | exists | Git-first editorial flow |
| PLAT-010 | P1 | new | Editorial states and review queue |
| PLAT-011 | P0 | partial | One validation command for every content type |
| PLAT-012 | P1 | new | Staleness and re-review queue |
| PLAT-013 | P0 | new | Partitioned, incremental builds |
| PLAT-014 | P0 | partial | Publishing state per (entity, locale) |
| PLAT-015 | P0 | new | Hosting capacity check at 10× the page count |
| PLAT-017 | P0 | new | Image pipeline: masters to AVIF, WebP and fallback |
| PLAT-018 | P1 | new | Step photo and caption standard |
| PLAT-019 | P1 | new | Print-ready cards and generated PDFs |
| PLAT-021 | P0 | partial | Finder index sharded by locale and facet |
| PLAT-022 | P1 | new | Site-wide static search index |
| PLAT-025 | P0 | exists | App analytics stance (no SDK) |
| PLAT-026 | P0 | new | Consent, Global Privacy Control and retention |
| PLAT-027 | P1 | new | Aggregate "We tried this" counters |
| PLAT-034 | P1 | new | Website offline reading |
| PLAT-035 | P1 | new | One content contract for web and app |
| PLAT-036 | P0 | partial | Performance budgets gated in CI |
| PLAT-037 | P0 | new | Visual regression at standard widths |
| PLAT-038 | P0 | partial | Accessibility automation and assistive-technology gates |
| PLAT-039 | P1 | new | Print and i18n tests |
| PLAT-040 | P1 | partial | Observability, uptime, broken links and cost guardrails |

#### Business model (16)

| ID | P | Status | Title |
|---|---|---|---|
| BIZ-004 | P0 | new | No paid placement, paid reviews or paid endorsements |
| BIZ-005 | P0 | new | Economic baseline and 12-month cost ledger |
| BIZ-006 | P1 | new | Optional supporter membership (one-time or monthly) |
| BIZ-007 | P1 | new | Printed packs and collections (one-time purchase) |
| BIZ-011 | P1 | new | Grants and philanthropy under a written grant policy |
| BIZ-012 | P1 | new | Research and evaluation funding |
| BIZ-016 | P1 | new | Paid review and translation as a cost line |
| BIZ-018 | P0 | new | No paid child content and no in-app purchases for children |

#### Metrics and evidence (17)

| ID | P | Status | Title |
|---|---|---|---|
| MET-001 | P0 | new | Confirmed activity starts ("We tried this") |
| MET-002 | P0 | new | Start rate |
| MET-003 | P1 | new | Prints, saves and shares per 1,000 card views |
| MET-004 | P1 | new | Pillar input: MAKE |
| MET-006 | P0 | new | Pillar input: CARE (older adults, dementia, caregivers) |
| MET-008 | P1 | new | Pillar input: PLAY (games) |
| MET-009 | P2 | new | Pillar input: TOGETHER (groups and intergenerational) |
| MET-010 | P0 | new | Reviewed coverage of indexed pages |
| MET-011 | P1 | new | Overdue reviews |
| MET-012 | P0 | new | Translation coverage and staleness |
| MET-013 | P1 | new | Correction speed |
| MET-014 | P1 | partial | Broken links and 404s on indexed pages |
| MET-015 | P1 | new | Source coverage on health-adjacent pages |
| MET-016 | P0 | partial | Accessibility defects per release |
| MET-017 | P0 | new | Assistive-technology task success |
| MET-018 | P0 | partial | Safety reports and safety-field completeness |
| MET-019 | P0 | partial | Claim-audit failures |
| MET-020 | P1 | new | Print legibility pass rate |
| MET-021 | P0 | new | Non-branded search impressions by cluster and locale |
| MET-022 | P1 | new | Top-three share for task queries |
| MET-023 | P1 | new | Search share per cluster |
| MET-024 | P1 | new | Index coverage of indexed pairs |
| MET-026 | P1 | new | Partner adoption |
| MET-028 | P2 | new | Printable distribution and reprints |
| MET-030 | P1 | new | Comprehension test pass rate |
| MET-031 | P1 | new | Return households |
| MET-034 | P0 | new | Time on site and page views (counter-metric) |
| MET-035 | P0 | new | Dark-pattern guardrails |
| MET-037 | P0 | new | Privacy-preserving measurement principles |
| MET-038 | P1 | new | Data-quality checks |
| MET-039 | P0 | new | Dashboards and review cadence |
| MET-040 | P1 | new | Cost per confirmed start |


### S3: expand by adjacency

**Goal.** Open new audiences one at a time, each with its own evidence: child-facing GROW content, educators and the school program, referrer pages, adjacent CARE clusters (for example, reminiscence and music), and the first reviewed language or two (section 4, item 6), each under its own gate.

**Entry gate, per segment (VISION Stage 2, "scale a segment if"). All of these:**
- **Real use:** confirmed starts (MET-001) above the minimum cell size (proposed 10) for three consecutive months in that segment.
- **Relevant queries:** impressions and top-three share for the segment's task queries rise (MET-022, MET-023).
- **Quality holds:** reviewed coverage is 100% of indexed pages (MET-010); zero overdue reviews on indexed pages (MET-011); zero critical accessibility defects per release (MET-016); broken links and 404s near zero (MET-014).
- **Effort falls:** cost per confirmed start (MET-040) falls over two quarters, with the cost ledger (BIZ-005) in place.
- **No kill trigger** (section 6) has fired.

**GROW (child-facing) has its own gate.** All six conditions in [08 section 10](08-pillar-parenting-kids.md) (CNT-890): the `ages` and `pillars` schema fields exist; counsel has signed off the child-directed determination; a US-targeted search gap is measured for R5 ranks 12 and 15; parents and carers (not children) complete usability sessions with an age-appropriate card; an early-years educator and an occupational therapist review the family cards; safety checks are recorded on every card. Adult-facing intergenerational content (CNT-870) does not wait for this gate, if it has no child data and no child-directed design.

**Child-privacy prerequisites sit in S2 on purpose:** TSA-019, TSA-020, TSA-021, WEB-072, CNT-801, CNT-850, CNT-880. GROW content cannot open until they are done.

#### Website (03)

| ID | P | Status | Title |
|---|---|---|---|
| WEB-021 | P2 | ? | Short demo video per activity |
| WEB-030 | P2 | new | Account-optional sync |
| WEB-041 | P3 | ? | Installable web app |
| WEB-043 | P1 | partial | Right-to-left and long-text layouts |
| WEB-047 | P2 | ? | Educator pages |
| WEB-048 | P2 | ? | Referrer handout for health and social professionals |

#### App (04)

| ID | P | Status | Title |
|---|---|---|---|
| APP-025 | P1 | partial | Language status and picker |
| APP-007 | P2 | new | Care-setting kiosk |
| APP-008 | P2 | new | Large-screen group session |
| APP-009 | P3 | new | Apple Watch glance |
| APP-012 | P2 | partial | Gentle reminders |
| APP-016 | P2 | new | No-account device transfer |
| APP-017 | P2 | new | Household profiles without health data |
| APP-027 | P3 | new | Adult-set child mode |
| APP-032 | P2 | ? | Read-aloud for cards |
| APP-033 | P3 | new | Printable "what we did" log |
| APP-035 | P3 | new | Opt-in aggregate counts |

#### Games (05)

| ID | P | Status | Title |
|---|---|---|---|
| GAME-023 | P2 | new | Word and picture pairs |
| GAME-024 | P3 | new | Rhyme pictures |
| GAME-028 | P2 | new | Music choices |
| GAME-030 | P3 | new | Draw a sound |
| GAME-036 | P3 | new | Stop-motion frame maker |
| GAME-045 | P3 | new | Photo timeline |
| GAME-053 | P2 | new | Sticker scene builder |
| GAME-054 | P2 | new | Big shapes and colors |
| GAME-055 | P2 | new | Lift-the-flap find |
| GAME-056 | P2 | new | Weather and mood chart |
| GAME-057 | P3 | new | Feed the animal |

#### MAKE: crafting (07)

| ID | P | Status | Title |
|---|---|---|---|
| CNT-711 | P3 | ? | Beads and jewelry |

#### GROW: parenting and kids (08)

| ID | P | Status | Title |
|---|---|---|---|
| CNT-810 | P1 | ? | Sensory play |
| CNT-811 | P2 | exists | Art and craft (GROW versions) |
| CNT-812 | P2 | ? | Pretend play |
| CNT-813 | P2 | ? | Outdoor play |
| CNT-814 | P2 | ? | Music and movement |
| CNT-815 | P2 | ? | Early literacy and numeracy through play |
| CNT-816 | P2 | ? | Science-ish making |
| CNT-817 | P2 | ? | Calm-down activities |
| CNT-818 | P2 | ? | Rainy-day and indoor |
| CNT-819 | P2 | ? | Travel and waiting-room |
| CNT-820 | P1 | ? | Screen-free swaps |
| CNT-800 | P0 | ? | GROW pillar rules and gate |
| CNT-830 | P1 | ? | Choose-your-level adaptations |
| CNT-840 | P1 | ? | Co-play roles |
| CNT-860 | P2 | ? | School and early-years program |
| CNT-890 | P0 | ? | Child-facing gate |

#### Community and UGC (11)

| ID | P | Status | Title |
|---|---|---|---|
| COM-022 | P2 | new | Partner organization pages ("Groups that use this") |
| COM-023 | P2 | new | Care-home coordinator feedback channel |
| COM-026 | P2 | new | Curated story page (with permission) |
| COM-027 | P2 | new | Volunteer translation and review contributions |
| COM-032 | P3 | new | Share a made card with someone at a distance |

#### Search, GEO and distribution (12)

| ID | P | Status | Title |
|---|---|---|---|
| SEO-038 | P2 | new | Life-story and storytelling (R5 rank 11) |
| SEO-039 | P2 | new | Relaxing art for adults (R5 rank 9) |
| SEO-040 | P3 | new | Sensory activities for children (R5 rank 12) |
| SEO-041 | P3 | new | Broad rainy-day and adult or kids' crafts (R5 ranks 13 to 15) |
| SEO-046 | P3 | new | Case stories with recorded data |

#### Localization (13)

| ID | P | Status | Title |
|---|---|---|---|
| L10N-028 | P2 | new | Community translation with reviewers |
| L10N-029 | P2 | ? | Participant-language test (GM-041) |
| L10N-031 | P2 | partial | Word games and sayings per language |

#### Platform and data (15)

| ID | P | Status | Title |
|---|---|---|---|
| PLAT-020 | P2 | new | Short video with captions and transcript |
| PLAT-029 | P2 | new | Local-first sync of saved items (end-to-end) |
| PLAT-030 | P2 | new | Family share links without personal data |
| PLAT-031 | P2 | new | UGC storage and processing pipeline |
| PLAT-032 | P2 | new | Moderation queue, SLA and audit log |
| PLAT-033 | P2 | new | Read-only open data feed |

#### Business model (16)

| ID | P | Status | Title |
|---|---|---|---|
| BIZ-008 | P2 | new | Printed book with a reviewed collection |
| BIZ-009 | P2 | new | Institutional license for planning and training tools |
| BIZ-010 | P2 | new | Library and community program licenses for bulk printing |
| BIZ-013 | P2 | new | Sponsorship rules |
| BIZ-014 | P3 | new | Affiliate links (only if evidence supports them) |

#### Metrics and evidence (17)

| ID | P | Status | Title |
|---|---|---|---|
| MET-005 | P2 | new | Pillar input: GROW (kids and parenting) |
| MET-007 | P2 | new | Pillar input: CALM (creative wellbeing) |
| MET-025 | P2 | new | AI-answer citations (exploratory) |
| MET-027 | P2 | new | Partner-reported use (aggregate) |
| MET-032 | P1 | new | Outcome research program |
| MET-036 | P2 | new | Channel dependence |


### S4: global scale, per language and cluster

**Goal.** Further languages and every cluster that has passed its gates in those languages. No language moves on machine text alone ([13](13-localization.md), L10N-005).

**Entry gate, per language (all of these):**
- A named native reviewer has signed off the Tier 1 surfaces (app, store, picture packs) and the website hubs and games (L10N-003, L10N-004).
- The reviewed pages enter sitemaps and `hreflang` only after sign-off (L10N-020, WEB-062). Search data decides the place in the queue.
- Local crisis information is verified against the official source for that locale (L10N-009).
- The day-30 spend check in [13](13-localization.md) passes. Below 10% of first-time downloads in a language, review spend stops after Spanish and Vietnamese.
- The cluster passes its S3 segment gate in that locale (MET-021 to MET-023 by locale).
- Platform capacity is checked first: partitioned, incremental builds (PLAT-013) and the hosting check at ten times the page count (PLAT-015).

#### Website (03)

| ID | P | Status | Title |
|---|---|---|---|
| WEB-049 | P3 | ? | Organization accounts |
| WEB-066 | P3 | ? | AI assistant |

#### App (04)

| ID | P | Status | Title |
|---|---|---|---|
| APP-015 | P3 | new | Optional account sync for website saves |

#### Localization (13)

| ID | P | Status | Title |
|---|---|---|---|
| L10N-030 | P3 | new | Languages beyond the reviewed list |

#### Trust, safety, accessibility, privacy (14)

| ID | P | Status | Title |
|---|---|---|---|
| TSA-050 | P3 | new | Physical kit product safety, if sold |

#### Platform and data (15)

| ID | P | Status | Title |
|---|---|---|---|
| PLAT-016 | P2 | new | On-demand rendering for the long tail |
| PLAT-023 | P3 | new | Server-side search for 100k pages and more |
| PLAT-028 | P3 | new | Optional account (gated) |

#### Business model (16)

| ID | P | Status | Title |
|---|---|---|---|
| BIZ-015 | P2 | new | App premium only for genuinely new features |
| BIZ-017 | P3 | new | Non-clinical facilitator training |

#### Metrics and evidence (17)

| ID | P | Status | Title |
|---|---|---|---|
| MET-033 | P3 | new | Caregiver wellbeing with a validated scale (partner-run) |


## 4. Pillar sequencing

1. **CARE first (existing evidence).** The strongest evidence sits here: the wedge clusters in [VISION](../../../VISION.md), the bedside hub, 88 guides and the existing cards. S1 funds the hubs, images, print and trust; S2 adds new cards (CNT-901 to CNT-911 not already in S1), the reminiscence hub (SEO-016) and music (SEO-037). The "therapeutic" title on an existing guide is fixed in S1 under TSA-028 (open decision 3).
2. **MAKE adapted crafts, after CARE's S1 gate.** MAKE is S2 work. The first cluster is limited dexterity and arthritis (CNT-902, SEO-017), which needs an occupational therapist's review before it goes live ([07](07-pillar-crafting.md), open question 4). Beads (CNT-711) stays P3 until the choking and adult-only question is decided.
3. **CALM within strict wording rules.** CALM is S2, and it opens only when these exist: the boundary policy (CNT-1000), the claim register (CNT-1001), reviewer roles (CNT-1004), a named credentialed reviewer for each scope (art therapist, grief-informed practitioner, psychologist; [10](10-pillar-creative-wellbeing.md) section 6), and a crisis route on grief and stress pages. Grief and remembrance making (CNT-1017) waits for a named reviewer before it publishes. Words such as "therapeutic", "healing" and "cure" stay out of titles, slugs and copy.
4. **GROW gated to S3, children's privacy first.** Child-directed design is not built until the S2 prerequisites in section 3 are done and the CNT-890 gate passes. Adult-facing intergenerational work (CNT-870, TOGETHER lens) runs in S2 without child data.
5. **PLAY (games).** The 12 live games stay as they are and receive no new S1 work. New adult games open in S2 with the picture-set licenses and audio licenses checked (GAME-026, GAME-028, GAME-029). Children's games (GAME-053 to GAME-057) wait for the GROW gate.
6. **Languages follow [13](13-localization.md), not the other way round.** English is the only S1 library. Today the website already shows machine-translated copies (189 locale codes) and app build 1.6.0 is submitted with 20 languages. S1 does not add to that. WEB-062 keeps unreviewed copies out of the index, and L10N-005 needs a decision on protected segments before 1.6.0 is approved (open decision 5). The first reviewed language, or at most two, enters S3 under the per-language gate in section 3. Further languages follow in S4. The launch order is undecided: the native review guide starts with Spanish and Vietnamese, while the SEO focus list starts with Japanese, Spanish, Portuguese and Italian (13 open question 2). Whichever order is chosen, no more than two languages get review spend before the day-30 check.

## 5. Dependencies and critical path

- **Stage 0 record, then SEO-002 and SEO-001, then the hubs (SEO-009, SEO-010).** A hub cannot be justified without a cluster map.
- **URL contract (SEO-003) before any hub or redirect ships.** Open decision 4 blocks this.
- **Named credentialed reviewer (TSA-034) before SEO-009 is indexable,** and before any CALM or occupational-therapy content. No reviewer is named today. This is the longest lead time in S1.
- **Image rights (TSA-038) before step photos (WEB-012).** Without WEB-012, the 20 original pages do not meet VISION.
- **Usability recruitment (TSA-002, MET-029) before the S1 gate.** Participants come through partners or a research panel, not through accounts.
- **Event dictionary (PLAT-024) and the GA4 decision before WEB-025 and MET-001 are reported.**
- **Search Console (SEO-004) and a three-month baseline before any S2 scale decision.** This is a calendar constraint.
- **Child-privacy prerequisites (TSA-019 to TSA-021, CNT-801, CNT-850, CNT-880, WEB-072) before any GROW content, and counsel's child-directed determination before the CNT-890 gate.**
- **Reviewed languages (L10N-003, L10N-004, L10N-009) and the index decision (L10N-033) before any S4 language is indexed.**
- **Platform capacity (PLAT-013, PLAT-015) before the page count grows past what the hosting check allows.**

**Critical path to the S1 gate:** reviewer named, then SEO-009 indexable, then usability sessions and fixes, then the S1 gate. **Critical path to any S2 scale decision:** three-month search baseline.

## 6. Kill and pause criteria

From [VISION](../../../VISION.md), plus the gate rules above. All are decided by the maintainer.

| Trigger | Action |
|---|---|
| Stage 0 shows no coherent query cluster, users do not struggle with existing options, or a card does not beat the top search result | Do not start the S1 hubs. |
| A critical accessibility or safety finding stays open after retest | Block the S1 gate. No expansion. |
| A hub fails H3 for two review cycles (H10) | Merge into its parent and redirect. |
| Queries for a segment are mostly informational and need no interactive product, or search results already satisfy the task | Pause or kill that segment (VISION Stage 2). |
| Adaptation for a segment is unsafe or too expensive to validate | Pause or kill that segment (VISION Stage 2). |
| Most pages in a segment would be near-duplicates | Kill the expansion; fix or merge the existing pages (SEO-015). |
| Impressions rise but starts stay flat for two quarters | Pause the cluster and review the card fit. |
| Any therapy, healing, cure or cognitive-outcome claim is published | Unpublish, log it in TSA-035, and review the claim register (TSA-028). |
| Counsel's child-directed determination is positive | GROW stays adult-facing; no child-directed design (CNT-890 condition 2). |
| A language falls below 10% of first-time downloads at the day-30 check | Stop review spend after Spanish and Vietnamese (13). |
| A translated copy is indexed without review | Set `noindex` at once (WEB-062) and record the incident. |

## 7. Open decisions for the maintainer

These were raised by writers in the source files. Each needs an answer before the phase it blocks. Options are listed; the spec does not choose.

| # | Decision | Options | Blocks | Source |
|---|---|---|---|---|
| 1 | **GA4 versus the no-tracker rule.** GA4 is live (approved 2026-10-25, ad personalization off). DESIGN section 7 forbids third-party trackers. | (a) Keep restricted GA4 with consent mode and amend DESIGN section 7; (b) remove GA4 and use a cookieless first-party counter (PLAT-027, which needs a server component); (c) both, documented. | WEB-025, WEB-068, PLAT-024, TSA-012, MET-001; S1 gate | [03](03-features-web.md) Q1; [14](14-trust-safety-accessibility-privacy.md) Q1; [15](15-platform-data-architecture.md) Q4; [12](12-search-geo-distribution.md) Q4 |
| 2 | **`/brain-health/` naming.** The guide section (10 guides) implies a cognitive outcome, which R4 section 5 rejects. | (a) Rename to a non-outcome term with a redirect-safe move; (b) keep and add a scope line on every guide. | TSA-029 wording; any CARE brain-health claim | [02](02-information-architecture.md) section 3 |
| 3 | **"Therapeutic" SEO title on `therapeutic-art-activities-for-adults`.** The title must change now. The slug question needs a redirect. | (a) Change title only; (b) change title and slug with redirect and a Search Console check. | CNT-909 (S2 content); TSA-028 (S1) | [09](09-pillar-older-adults-dementia.md) CNT-909; [10](10-pillar-creative-wellbeing.md) open question |
| 4 | **URL scheme.** Three documents disagree: shipped `/activity/<slug>/`; root hubs in SEO.md section 4.1; the web-SEO strategy's paths. | Pick one scheme and record it as the contract. | SEO-003, SEO-009, SEO-010, all redirects | [12](12-search-geo-distribution.md) Q1; [02](02-information-architecture.md) section 3 |
| 5 | **Languages: index policy, launch order, count of record and 1.6.0 machine text.** (a) The 2026-11-01 decision indexes expansion languages, but the plan keeps unreviewed languages out of search. (b) Review order versus SEO focus order. (c) 88 guides in 189 codes versus 40 guides in 19 languages. (d) Protected segments in 1.6.0 machine text (L10N-005). | (a) Which rule wins (L10N-033); (b) pick one order; (c) pick the count of record; (d) hide or flag protected segments, or record the risk and its owner before approval. | L10N-033, L10N-002, L10N-001, L10N-005; S4 | [13](13-localization.md) Q1, Q2, Q3, Q6; [14](14-trust-safety-accessibility-privacy.md) Q6 |
| 6 | **Subscription.** The strategy document recommends a "Family Plus" subscription. The plan's verdict is no. | (a) Formally reject it; (b) keep it as a later option, with the day-90 gates. This spec assumes (a), with BIZ-006 (optional giving) and BIZ-007 (one-time printed packs) as the only revenue lines. | BIZ-006 to BIZ-010; any S3 revenue work | [16](16-business-model.md) Q1 |
| 7 | **Account and sync boundary.** APP-015 asks for account sync, but the product contract excludes accounts and cloud sync. | (a) Keep device transfer (APP-016) as the only sync path; (b) the maintainer changes the contract. Organization accounts (WEB-049) and optional accounts (PLAT-028) stay S4 and gated. | APP-015, APP-016, WEB-049, PLAT-028 | [04](04-features-app.md) Q2; [15](15-platform-data-architecture.md) Q8 |
| 8 | **Named credentialed reviewers.** None is named. Scopes needed: dementia (SEO-009, CNT-907); CALM (art therapist US or UK, grief-informed practitioner, psychologist); occupational therapy (seated and arthritis cards, CNT-902, CNT-924); early-years educator (GROW); cultural reviewers (CNT-713, CNT-926). Who is paid, and at what rate? | Name reviewers and record scope in TSA-034. | SEO-009 (S1), CALM (S2), GROW (S3), every S4 language | [README](README.md) open question 3; [09](09-pillar-older-adults-dementia.md); [10](10-pillar-creative-wellbeing.md) section 6; [14](14-trust-safety-accessibility-privacy.md) Q4; [06](06-content-library.md) open question 1 |
| 9 | **Content license.** (a) Contributions: a site license with credit, or an open license such as CC BY? It affects translation, partner reuse and AI training. (b) Open activity packs (SEO-045) need a license chosen with counsel. (c) Audio and lyric licenses for GAME-026, GAME-028, GAME-029. (d) Open data feed license (PLAT-033). | Decide (a) before COM-002; decide (b) to (d) before each item ships. | COM-002, COM-019, SEO-045, GAME-026, GAME-028, GAME-029, PLAT-033 | [11](11-community-ugc.md) section 3.5 and open questions; [05](05-games.md) Q2; [15](15-platform-data-architecture.md) Q7 |
| 10 | **Crisis-route owner.** Who checks each locale's route against its official source, and who keeps it current? | Name an owner for UK, Ireland, US now, and for each later language. | WEB-061 (S1); L10N-009 (S4) | [03](03-features-web.md) Q4; [13](13-localization.md) Q5 |
| 11 | **Child-directed status.** Is any GROW design child-directed under COPPA factors and the UK code? This decides whether cartoon styling, music and child styling are allowed, and which minimum ages apply by market. | Counsel's written determination. | CNT-890 condition 2; TSA-018 to TSA-021; GAME-053 to GAME-057 | [08](08-pillar-parenting-kids.md) Q1; [14](14-trust-safety-accessibility-privacy.md) Q3 |
| 12 | **Response targets.** TSA-045 (unsafe or wrong activity) and TSA-035 (corrections) need response times. The spec proposes none as measured. | Maintainer sets targets. | TSA-035, TSA-045 (S1 gate) | [14](14-trust-safety-accessibility-privacy.md) Q5 |
| 13 | **Measurement setup.** Search Console and Bing verification; minimum cell size (proposed 10); who runs the consented return-household panel (MET-031). | Confirm each; name the panel owner. | MET-021, MET-024, MET-001, MET-031 | [17](17-metrics-and-evidence.md) open questions 2 to 4 |
| 14 | **Legacy timed mode in the app.** Timed mismatch and hint dismissal remain in old game code. | Remove before any "no pressure" claim covers every game. | APP-014 to APP-026 claims; GAME-014, GAME-015 | [04](04-features-app.md) open question; [05](05-games.md) open question |
| 15 | **Old domain and brand.** The web SEO strategy was written for the earlier domain and name. Old host and old domain still serve. | Choose the migration plan and the audit of old copy. | SEO-005, L10N rename check | [12](12-search-geo-distribution.md) Q3; [13](13-localization.md) rename check |

**Data notes for the maintainer.** (a) In `id-index.tsv` the title column for CNT-901 to CNT-911 shows only numbers; the real titles are in [09](09-pillar-older-adults-dementia.md). (b) 62 items had no priority or phase; all now have both in [phase-overrides.tsv](phase-overrides.tsv). (c) Before overrides, 231 items were S1 and only 40 are kept; the other 191 move to S2 with a reason in the same file.
