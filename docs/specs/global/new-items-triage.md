# New items triage

Date: 2026-11-22. Scope: all 162 rows with status `new` in [id-index.tsv](id-index.tsv), phases S2, S3 and S4. This file is a recommendation for the lead; no status in the index or the roadmap was changed.

Method: each item's full text was read from its `###` section, or from its table row where the item is a table row (the digest covered Why, What, Acceptance, Depends on and Risks). Each ID and feature was grepped in `site/`, `lib/`, `scripts/` and `tests/`, and the app's `pubspec.yaml` was checked for the packages a feature would need. Dependencies were read from the index. A `build` row names the test that proves it; device, reviewer, counsel and usability checks in a build row are listed as manual steps, not as blockers.

Counts: build 13, decision 22, person 36, service 35, later 55, built 1 (total 162). Lead corrections on 2026-11-22: PLAT-034 moved from build to decision (privacy review first, per the decided table in COMPLETION.md); SEO-041 moved from decision to later (decided 2026-11-21). Updated 2026-11-22 after batches 63 to 68: all 13 `build` rows are now built (partial, pending device and person checks); the class counts above are the triage as made.

Tooling: 11 of the 13 build rows are in the Flutter app (APP-, GAME-016, GAME-017, GAME-027). They need the pinned Flutter SDK (`.fvmrc`: 3.47.7), which the machine used for this triage does not have, so they are buildable only where the SDK is installed and the widget tests can run. The two website rows (BIZ-018, COM-024) are buildable here.

Findings:
- COM-001 ("We tried this") is already built as the WEB-025 control (`site/src/components/ActivityFeedback.astro`, `site/src/lib/activity-feedback.ts`, event through `track()`). The index row is wrong; the lead should confirm the monthly-count rule before changing it.
- WEB-040 and PLAT-034 describe the same service worker. Build it once under PLAT-034; WEB-040 is listed as later.
- No service worker exists yet (`site/public` has none).
- App packages already present: `url_launcher`, `share_plus`, `shared_preferences`. No print package is present, so APP-002 needs one plus device checks.

Class key: `build` a coding agent can build and verify here now; `decision` a named maintainer or boundary decision is needed; `person` a reviewer, counsel, translator, artist, usability session or device test is needed; `service` needs an account, server, third-party service or spending; `later` depends on an unbuilt item or is in a later phase; `built` already built, the index is wrong.

Build plans (one line each, with the proving test):
- APP-003: plan CRUD on shared_preferences, five-item cap, restart test (`test/` widget test).
- APP-005: port finder filters to Dart, shared fixture with the website, no network call in test.
- APP-014: url_launcher link with no parameters; QR encoder added; widget tests for URL and fallback.
- APP-020: pure share-text builder over share_plus; unit test of payload contents.
- APP-022: bedside theme from `gm` tokens; widget tests for target sizes and sound-off default.
- APP-023: haptics off by default; test that no action depends on haptics.
- APP-028: keyboard shortcuts and focus order on picture games; widget tests.
- APP-030: per-activity ticks, cleared with data deletion; widget tests.
- BIZ-018: test that child-directed routes contain no checkout or donate links.
- COM-024: local notes and printable list on the browser tried list; unit and Playwright tests.
- GAME-016: tap-to-place puzzle; widget tests; English text only.
- GAME-017: tap-to-group sorting with undo; widget tests.
- GAME-027: visible-pulse game, no score; widget tests for no timer text.
- PLAT-034 (now a decision, see table): versioned service worker for cards, print pages and finder; Playwright offline test; CSP check.

## Items

| ID | Phase | Priority | Class | Reason or plan |
|---|---|---|---|---|
| APP-014 | S2 | P0 | build | url_launcher is already a dependency; add a QR encoder and test the canonical URL has no parameters. Screen-reader pass stays manual. Built in batch 67 (PR #130) and placed on the card screen in batch 68 (PR #132). |
| BIZ-018 | S2 | P0 | build | Add a test that child-directed routes contain no checkout, donate or purchase links. Counsel review stays separate. Built in batch 65 (PR #128). |
| APP-003 | S2 | P1 | build | Plan CRUD on shared_preferences with a five-item cap and restart test. Printing waits for APP-002. Built in batch 67 (PR #130); on the Home menu. |
| APP-005 | S2 | P1 | build | Port the website finder filters to Dart over bundled cards; shared fixture test; no network call in airplane-mode test. Built in batch 67 (PR #130) and on the Home menu in batch 68 (PR #132). |
| APP-020 | S2 | P1 | build | share_plus is already used; a pure builder shares title, description and canonical link as plain text. Unit-test the payload. Built in batch 67 (PR #130) and placed on the card screen in batch 68 (PR #132). |
| APP-030 | S2 | P1 | build | Per-activity ticks in shared_preferences, cleared with data deletion; widget tests for the all-ticked message and no links. Built in batch 67 (PR #130) and shown on the card screen in batch 68 (PR #132). |
| PLAT-034 | S2 | P1 | decision | Maintainer allowed a reviewed service worker (2026-11-21) but it needs a privacy review first; see COMPLETION.md decisions. |
| APP-022 | S2 | P2 | build | Bedside theme from gm tokens and a large-control variant; widget tests for target sizes and sound-off default. Built in batch 67 (PR #130). |
| APP-023 | S2 | P2 | build | Haptics off by default and never the only feedback; widget test that no action depends on haptics. Built in batch 67 (PR #130). |
| APP-028 | S2 | P2 | build | Keyboard shortcuts and focus order on picture games with widget tests. The one-switch device pass stays manual. Built in batch 67 (PR #130). |
| COM-024 | S2 | P2 | build | Extend the browser tried list with local notes and a printable list. Nothing is sent; unit and Playwright tests. Built in batch 65 (PR #128). |
| GAME-016 | S2 | P2 | build | Tap-to-place two- or four-piece puzzle in Flutter using existing pictures; English text now, translations later. Built in batch 67 (PR #130), a pilot game behind the experiments flag. |
| GAME-017 | S2 | P2 | build | Tap-to-group picture sorting with undo on existing packs; widget tests for undo and no timer. Built in batch 67 (PR #130), a pilot game behind the experiments flag. |
| GAME-027 | S2 | P2 | build | Visible-pulse tap game with no score; widget tests for no timer text and a single-switch input path. Built in batch 67 (PR #130), a pilot game behind the experiments flag. |
| BIZ-004 | S2 | P0 | decision | Editorial no-paid-placement policy text needs maintainer sign-off before it is published. |
| COM-006 | S2 | P0 | decision | Three-choice wording and replacing the WEB-026 reasons need a maintainer decision; copy must reach all 185 codes. |
| L10N-033 | S2 | P0 | decision | Maintainer must record the top-50 index decision before those languages are indexed; conflicts with L10N-020. |
| CNT-890 | S3 | P0 | decision | Child-facing gate is a maintainer decision on children's content, the S3 gate itself. |
| BIZ-006 | S2 | P1 | decision | Donations need a maintainer decision to lift the payments boundary in product.md. |
| BIZ-007 | S2 | P1 | decision | Printed sales need the payments decision and a fulfillment partner choice. |
| BIZ-011 | S2 | P1 | decision | Grant policy needs the maintainer-set funder cap before any application. |
| PLAT-027 | S2 | P1 | decision | Counts need a server endpoint; the site has none, and the item text requires a maintainer decision first. |
| APP-021 | S2 | P2 | decision | A generated share image is file sharing, which APP-020 says needs a separate approval first. |
| SEO-045 | S2 | P2 | decision | Pack license must be chosen with counsel before any pack is published. |
| APP-016 | S3 | P2 | decision | Device transfer needs approval, and file exchange is deferred under GM-022. |
| APP-017 | S3 | P2 | decision | Household profiles need approval; scope depends on GM-020 and GM-027 product rules. |
| PLAT-029 | S3 | P2 | decision | Sync needs the PLAT-028 account or pairing decision and a key-recovery design first. |
| PLAT-033 | S3 | P2 | decision | Open data feed waits for a license choice with counsel. |
| WEB-030 | S3 | P2 | decision | Sign-in sync conflicts with the no-account contract; needs a maintainer decision under PLAT-028. |
| BIZ-015 | S4 | P2 | decision | App purchases need the payments decision and Apple and Google purchase rules. |
| APP-027 | S3 | P3 | decision | Child mode needs approval and counsel review under COPPA and the Children's Code first. |
| APP-035 | S3 | P3 | decision | Any telemetry needs explicit maintainer approval; AGENTS forbids new telemetry without it. |
| SEO-041 | S3 | P3 | later | Decided 2026-11-21: keep the kids guides for parents (spec rewritten in batch 62); broad new pages wait for evidence. |
| APP-015 | S4 | P3 | decision | Account sync is not approved and conflicts with the no-account contract; needs a product change and privacy review. |
| PLAT-028 | S4 | P3 | decision | Optional accounts need a maintainer decision and legal review; gated to the day-90 roadmap. |
| WEB-066 | S4 | P3 | decision | AI assistant: AGENTS bars AI processing in the product without an explicit maintainer decision. |
| BIZ-005 | S2 | P0 | person | Cost ledger needs real invoices and named owners; the agent can only prepare a template. |
| CNT-032 | S2 | P0 | person | Disclosure wording needs counsel; the aiAssisted flag work follows once the policy text is approved. |
| COM-014 | S2 | P0 | person | Child rules need legal review before launch and a counsel-checked Children's Code list. |
| COM-019 | S2 | P0 | person | License and credit text needs legal review before any contribution is accepted. |
| COM-020 | S2 | P0 | person | Guidelines need safeguarding lead and CARE or CALM reviewer sign-off. |
| COM-030 | S2 | P0 | person | Accessibility claims need testing with at least three assistive-technology users before launch. |
| L10N-004 | S2 | P0 | person | Native reviewers must be recruited and named; this cannot be built in the repo. |
| L10N-011 | S2 | P0 | person | Translated cards need named native reviewers and the L10N-006 review gate. |
| MET-017 | S2 | P0 | person | Needs assistive-technology users in sessions; cannot be automated. |
| TSA-020 | S2 | P0 | person | UK Children's Code assessment is a written, counsel-checked record per launch. |
| APP-002 | S2 | P1 | person | Print output needs AirPrint and Mopria printer checks on devices; the print path is a device test. |
| APP-011 | S2 | P1 | person | Quick actions need native shortcut setup and device tests on iOS and Android. |
| APP-029 | S2 | P1 | person | Stop-signal wording needs a named reviewer before release; safety lines need specialist review. |
| APP-031 | S2 | P1 | person | Picture icons need rights-cleared art and usability sessions with non-readers. |
| BIZ-012 | S2 | P1 | person | Research funding needs a research partner, ethics approval and a publication agreement. |
| BIZ-016 | S2 | P1 | person | Rate card needs a maintainer rate decision and named paid reviewers. |
| COM-033 | S2 | P1 | person | Moderator training and welfare route need staff time and an external support provider. |
| GAME-029 | S2 | P1 | person | Lyric sheets need rights checks per language before publishing. |
| GAME-059 | S2 | P1 | person | Commissioned art with alt text is needed; start with four original images by an artist. |
| MET-026 | S2 | P1 | person | Partner counts need written permission records from real partners. |
| MET-030 | S2 | P1 | person | Comprehension test needs participants for each template. |
| MET-031 | S2 | P1 | person | Return households need a consented diary panel recruited with people. |
| SEO-023 | S2 | P1 | person | Demonstration videos need filming and consent; the Shorts channel is run by a person. |
| TSA-040 | S2 | P1 | person | Platform-law duties need counsel's written opinion before any user content goes live. |
| WEB-019 | S2 | P1 | person | Picture cards need rights-cleared pictures and five-person usability tests. |
| MET-032 | S3 | P1 | person | Outcome research needs a named partner, pre-registration and ethics approval. |
| APP-010 | S2 | P2 | person | Home-screen widget needs a native extension and device tests on iOS and Android. |
| CNT-010 | S2 | P2 | person | Video needs filming, consent, captions and a made-for-kids label decision by a person. |
| CNT-011 | S2 | P2 | person | Narration needs human recordings; any synthetic voice needs a label and listening review. |
| CNT-1017 | S2 | P2 | person | Grief content needs grief-informed practitioner review before publication. |
| CNT-1019 | S2 | P2 | person | Routine content needs the app routine device-tested, per the wellbeing spec. |
| GAME-026 | S2 | P2 | person | Sound set needs a license review under GM-025 before it is published. |
| GAME-042 | S2 | P2 | person | Bird names per language and region need a reviewer; an English build alone is not enough. |
| MET-009 | S2 | P2 | person | Group use comes from consented diaries and partner summaries, not from the repo. |
| APP-007 | S3 | P2 | person | Kiosk mode needs Guided Access tested on a device and an approval for the use case. |
| L10N-029 | S3 | P2 | person | A family usability test decides whether the hypothesis holds. |
| COM-009 | S2 | P0 | service | Moderation queue needs a hosted queue and trained moderators. |
| COM-010 | S2 | P0 | service | Reporting route needs a server, a moderation desk and counsel's legal check. |
| COM-012 | S2 | P0 | service | Rate limits and magic-link email need a server and an email provider. |
| COM-013 | S2 | P0 | service | Display names and verified email need server-side storage with no accounts. |
| COM-015 | S2 | P0 | service | Consent checkbox belongs to photo upload, which needs the server. |
| COM-016 | S2 | P0 | service | EXIF stripping and private originals need server-side image processing. |
| COM-018 | S2 | P0 | service | Alt text field belongs to the upload form, which needs the server. |
| COM-029 | S2 | P0 | service | Edit, delete and export links need a mail provider and server. |
| MET-002 | S2 | P0 | service | Start rate needs event data from the analytics account; not buildable from the repo alone. |
| MET-021 | S2 | P0 | service | Needs Search Console properties verified for each domain and locale. |
| SEO-005 | S2 | P0 | service | Old-host redirects need access to the old host, DNS and Search Console changes. |
| APP-013 | S2 | P1 | service | Store listing and universal link need store accounts and the GM-032 attribution token. |
| COM-002 | S2 | P1 | service | User notes need a server for moderated submissions; the site has no server. |
| COM-003 | S2 | P1 | service | Photo uploads need server storage, EXIF removal and private originals. |
| COM-004 | S2 | P1 | service | Tips need submission storage and an editor queue on a server. |
| COM-005 | S2 | P1 | service | Variation submissions need a server queue and review records. |
| COM-008 | S2 | P1 | service | Question submissions need a moderated server queue. |
| COM-011 | S2 | P1 | service | Appeals need a server record of decisions and a second reviewer. |
| COM-017 | S2 | P1 | service | On-device face blur needs a model with license review; the upload path needs the server. |
| COM-021 | S2 | P1 | service | Editorial queue needs a server and role-based access. |
| COM-034 | S2 | P1 | service | Community metrics need the event pipeline and moderation data. |
| MET-003 | S2 | P1 | service | Counts per 1,000 views need the analytics account. |
| MET-004 | S2 | P1 | service | Pillar counts need analytics data for the MAKE cluster. |
| MET-008 | S2 | P1 | service | Game counts need analytics; offline success needs throttled device sessions. |
| MET-022 | S2 | P1 | service | Rank tracking needs a third-party tool and a query set. |
| MET-023 | S2 | P1 | service | Search share estimate needs Search Console and a SERP audit. |
| MET-024 | S2 | P1 | service | Index coverage comes from Search Console for each property. |
| SEO-019 | S2 | P1 | service | AI citation benchmark needs Bing and Search Console accounts. |
| SEO-024 | S2 | P1 | service | Pinterest pins need a business account and publishing access. |
| SEO-026 | S2 | P1 | service | Opt-in digest needs an email provider with a DPA; duplicates WEB-071. |
| TSA-039 | S2 | P1 | service | Public reporting and queue need the community server first. |
| WEB-071 | S2 | P1 | service | Double opt-in email needs an email provider and a stored list. |
| COM-028 | S2 | P2 | service | Monthly digest needs an email provider and a double opt-in list. |
| PLAT-031 | S3 | P2 | service | Quarantine storage and hash checks need hosted buckets and a hash provider. |
| PLAT-032 | S3 | P2 | service | Queue states and audit log need server storage. |
| COM-007 | S2 | P1 | later | Filter by fit depends on the fit reports in COM-006, a decision; the facet-only filter is web work. |
| MET-040 | S2 | P1 | later | Cost per confirmed start depends on the BIZ-005 cost ledger. |
| WEB-040 | S2 | P1 | later | Same service worker as PLAT-034; build it there. Depends on WEB-041, an installable app, still partial. |
| CNT-830 | S3 | P1 | later | Choose-your-level adaptations are S3 and depend on the adaptation model still in progress. |
| COM-025 | S2 | P2 | later | Credited card depends on contributor credit in COM-019, which needs legal review. |
| SEO-044 | S2 | P2 | later | VideoObject needs real videos with transcripts; depends on SEO-023. |
| APP-008 | S3 | P2 | later | Large-screen mirroring is S3 and needs approval plus AirPlay device evidence. |
| APP-032 | S3 | P2 | later | Read-aloud is S3 and needs approval under GM-011 with an on-device voice. |
| BIZ-008 | S3 | P2 | later | Printed book is S3 and needs a reviewed collection and a publisher. |
| BIZ-009 | S3 | P2 | later | Institutional license is S3 and depends on planning features not yet built. |
| BIZ-010 | S3 | P2 | later | Library licenses are S3 and depend on printed packs in BIZ-007. |
| BIZ-013 | S3 | P2 | later | Sponsorship is S3 and needs the published policy from BIZ-004 first. |
| CNT-812 | S3 | P2 | later | GROW pillar content is S3 and waits for the children's gate in CNT-890. |
| CNT-814 | S3 | P2 | later | GROW pillar content is S3 and waits for the children's gate in CNT-890. |
| CNT-815 | S3 | P2 | later | GROW pillar content is S3, behind the CNT-890 gate and language review. |
| CNT-816 | S3 | P2 | later | GROW pillar content is S3, behind the CNT-890 gate and safety review. |
| CNT-819 | S3 | P2 | later | GROW pillar content is S3, behind the CNT-890 gate. |
| CNT-860 | S3 | P2 | later | School program is S3 and depends on the GROW pillar gate. |
| COM-022 | S3 | P2 | later | Partner pages are S3 and need written permission from each partner. |
| COM-023 | S3 | P2 | later | Care-home feedback channel is S3 and depends on the fit-report decision in COM-006. |
| COM-026 | S3 | P2 | later | Story page is S3 and needs permissions and the moderation pipeline. |
| COM-027 | S3 | P2 | later | Volunteer translation is S3 and depends on the review workflow and moderation. |
| GAME-028 | S3 | P2 | later | Music choices are S3 and need licensed audio per market. |
| GAME-053 | S3 | P2 | later | Sticker scene builder is S3 and needs its own content and review pass. |
| GAME-054 | S3 | P2 | later | Toddler shapes mode is S3 and needs age-band content review. |
| GAME-055 | S3 | P2 | later | Flap find is S3 and needs print-first content. |
| GAME-056 | S3 | P2 | later | Weather chart is S3 and needs per-language labels. |
| L10N-028 | S3 | P2 | later | Community translation is S3 and depends on the review workflow and reviewers. |
| MET-005 | S3 | P2 | later | GROW input metric waits until the GROW gate passes. |
| MET-025 | S3 | P2 | later | AI citation sampling is S3 exploratory and depends on MET-021. |
| MET-027 | S3 | P2 | later | Partner aggregate reports are S3 and depend on partners in MET-026. |
| MET-036 | S3 | P2 | later | Channel dependence is S3 and needs the MET-001 baseline. |
| PLAT-020 | S3 | P2 | later | Short video hosting is S3 and depends on PLAT-003 and a hosting decision. |
| PLAT-030 | S3 | P2 | later | Share links are S3 and depend on the PLAT-027 counter decision. |
| WEB-021 | S3 | P2 | later | Demo video is S3 and needs video production with captions. |
| WEB-047 | S3 | P2 | later | Educator pages are S3 and need an early-years educator review. |
| PLAT-016 | S4 | P2 | later | On-demand rendering is S4 and depends on PLAT-015 plus adapter support checks. |
| APP-009 | S3 | P3 | later | Apple Watch glance is S3 and needs native watch scope approval. |
| APP-033 | S3 | P3 | later | Printable log is S3 and depends on APP-002 print evidence from a device. |
| BIZ-014 | S3 | P3 | later | Affiliate links are S3 and need evidence and a commission-neutral audit. |
| COM-032 | S3 | P3 | later | Remote sharing is S3 and needs usability evidence first. |
| GAME-024 | S3 | P3 | later | Rhyme pictures are S3 and need per-language rhyme sets written by a writer. |
| GAME-030 | S3 | P3 | later | Draw-a-sound is S3 and needs an audio synthesis approach; low priority. |
| GAME-036 | S3 | P3 | later | Stop-motion maker is S3 and needs a clip encoding path; low priority. |
| GAME-045 | S3 | P3 | later | Photo timeline is S3 and needs the consent and family-photo rules first. |
| GAME-057 | S3 | P3 | later | Feed the animal is S3 and needs per-language art. |
| SEO-040 | S3 | P3 | later | Children's sensory pages are S3, gated on children's controls and GROW evidence. |
| SEO-046 | S3 | P3 | later | Case stories are S3 and need recorded consent and real data. |
| BIZ-017 | S4 | P3 | later | Facilitator course is S4 and needs credentialed review of any clinical content. |
| L10N-030 | S4 | P3 | later | Languages beyond the reviewed list enter only at S4, behind gates. |
| MET-033 | S4 | P3 | later | Caregiver wellbeing scale is S4 and depends on the MET-032 research program. |
| PLAT-023 | S4 | P3 | later | Server-side search is S4; build only when logs show the need. |
| TSA-050 | S4 | P3 | later | Kit product safety is S4 and applies only if a kit is sold. |
| WEB-049 | S4 | P3 | later | Organization accounts are S4 and need proven partner demand plus accounts. |
| COM-001 | S2 | P0 | built | Built as the WEB-025 control: ActivityFeedback.astro with a browser-only tried list and an allowlisted track() event. Index row is wrong; confirm the monthly-count rule. |
