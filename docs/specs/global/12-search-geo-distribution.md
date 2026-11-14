# 12. Search, GEO and distribution (SEO-###)

This file says how people find creative activities through search, AI answer engines and other channels, and what the website must do so that discovery stays honest and useful at global scale. It extends [SEO.md](../../../SEO.md), [web SEO strategy](../../strategy/web-seo.md) and [link building](../../strategy/link-building.md). It does not repeat them. Where those documents disagree, the disagreement is listed under Open questions instead of being resolved silently.

**Read with:** [README](README.md) · [research 05, search and trust](research/05-search-scale-trust.md) · [language markets](../../plan/language-markets.md) · [localization](13-localization.md) · [trust, safety, accessibility, privacy](14-trust-safety-accessibility-privacy.md) · [web features](03-features-web.md) · [content library](06-content-library.md) · [community and UGC](11-community-ugc.md) · [metrics](17-metrics-and-evidence.md) · [roadmap](18-roadmap.md) · [app features](04-features-app.md) · [CRAFTING](07-pillar-crafting.md) · [GROW](08-pillar-parenting-kids.md) · [CARE](09-pillar-older-adults-dementia.md) · [CALM](10-pillar-creative-wellbeing.md)

## Starting point (baseline, 2026-11-14)

- **Activity pages:** 38 English activity cards at `/activity/<slug>/`, each with HowTo JSON-LD and a print card with a QR code (README baseline).
- **Hubs:** 4 English hubs (activities for seniors, arts and crafts for seniors, bedside, grandparent and grandchild). No dedicated dementia hub and no seated hub.
- **Guides:** 88 English guides, in three sections. Translated versions are mostly held out of the search index (see [localization](13-localization.md)).
- **Discovery plumbing:** sitemaps, `llms.txt`, schema.org types, IndexNow. Search Console and Bing Webmaster Tools verification status is not recorded in the baseline. The 2026-10-30 note in the web SEO strategy lists Bing verification and sitemap submission as still to do. Confirm before relying on either.
- **Demand evidence:** none that is usable for a US-first decision. The only Google keyword export is Vietnam-targeted and priced in VND, with rounded volume buckets [R5 §3.1]. The App Store signal (about 400 organic downloads a month for an existing dementia activity app) is founder-reported and unverified [SEO.md §1].

## Cluster strategy

The working cluster list is the 15-cluster ranking in [R5 §6]. It is a judgment ranking, not a measured one. The table maps each cluster to what exists today and what this spec adds. Ranks 1 to 12 get an owner. Ranks 13 to 15 are hub-only.

| R5 rank | Cluster | Today | Item |
| --- | --- | --- | --- |
| 1 | Seated and bedside activities for seniors | Bedside hub only | SEO-010 |
| 2 | Easy crafts with arthritis or limited dexterity | Adaptations inside activity pages; no cluster page | SEO-017 |
| 3 | Reminiscence activities (non-clinical) | Not a hub | SEO-016 |
| 4 | Printable activities for older adults | 2 printable packs | SEO-022 |
| 5 | Grandparent and grandchild activities | Hub exists | SEO-018 |
| 6 | Christmas and holiday crafts for seniors | Not a hub | SEO-036 |
| 7 | Dementia activities at home | Missing; home page covers the games intent | SEO-009 |
| 8 | Easy art activities for seniors | Hub exists (arts and crafts for seniors) | Owned by SEO-017 |
| 9 | Relaxing art activities for adults | Not a hub; wording risk | SEO-039 |
| 10 | Music activities for seniors | Not a hub | SEO-037 |
| 11 | Storytelling and life-story activities | Not a hub | SEO-038 |
| 12 | Low-mess sensory activities for children | Not started; gated | SEO-040 |
| 13 to 15 | Broad rainy-day, adult and kids' crafts | Not started | SEO-041 |

## Page-type and content rules

These rules decide what may be indexed. They come from the content model in [DESIGN.md §5](../../../DESIGN.md) and [SEO.md §4 and §13](../../../SEO.md).

- One **activity** page per activity idea. Variations (seated, bedside, large-grip, low-vision, nonverbal, less-sensory, with children, group, collaborative) live on that page. A variation gets its own page only when its materials, safety notes or outcome are substantially different.
- One **hub** per search intent, with selection criteria that are real for that intent. A hub is never the same list with the audience word swapped.
- One **guide** only when it answers a question no activity page answers.
- Print views and filter states do not compete with the canonical page.

Google's spam policies name scaled content abuse and site reputation abuse [R5 §2.4, refs 12 and 13]. Its helpful-content signals now sit inside core ranking [R5 §2.4, ref 15]. A reported change to site reputation abuse enforcement in the EEA is unverified [R5 §2.4, ref 14]. Plan as if the rules apply everywhere.

---

## P0 items

### SEO-001 · Cluster map from the R5 ranking
Priority P0 · Phase S1 · Status partial · Pillars: CARE, MAKE, CALM, GROW (cross-cutting TOGETHER)

Why: Search work needs one ordered list of clusters, each with an owner, or pages get written by enthusiasm [R5 §6; VISION "search-first growth"].

What: Keep the 15-cluster table in this file as the working list. Each row records its owner (hub or activity family), its evidence status (judgment, US export, SERP audit, Search Console), and the date it was last checked.

Acceptance:
- Every cluster in ranks 1 to 12 has an owner page or an explicit "hold" decision with a reason.
- Ranks 13 to 15 have no dedicated page. They link only from a hub.
- No cluster moves up the order until SEO-002 data exists for it.

Depends on: SEO-002, SEO-003.
Risks / not doing: Do not treat R5's ranking as a forecast. Do not add a cluster because a competitor has one.

### SEO-002 · Replace the wrong-market demand data
Priority P0 · Phase S1 · Status new · Pillars: all

Why: The current export cannot support any US or English decision [R5 §3.1]. Competition in that export is a Google Ads metric, not organic difficulty [SEO.md §1].

What: Pull a US-English Keyword Planner export for the 15 cluster query sets, plus one contrasting market. Record targeting, network, period and export date beside each file. Pull Google Trends (US, relative only) and Pinterest Trends for the same terms. Run a SERP audit of the top 10 results per cluster, recording domain type, page type, whether AI Overviews appear, and whether any result is playable or printable [R5 §7 steps 1 to 4; SEO.md §3.4].

Acceptance:
- Each volume figure states source, locale, period and method. A blank cell means unknown, not zero.
- A single table shows, for each cluster, result types in the top 10 and whether a caregiver can act on any of them without signing up.
- The audit is repeated after 6 to 8 weeks of Search Console data for the launched pages.

Depends on: none.
Risks / not doing: Do not invent volumes for the head terms "activities for seniors" or "dementia" [SEO.md §1].

### SEO-003 · One URL contract
Priority P0 · Phase S1 · Status new · Pillars: all

Why: Three documents give three URL schemes. The shipped site uses `/activity/<slug>/`. [SEO.md §4.1](../../../SEO.md) proposes root hubs such as `/activities-for-seniors/` and `/activities/memory-collage/`. The [web SEO strategy](../../strategy/web-seo.md) proposes `/activities/alzheimers/` and `/games/`. A rename after indexing loses rankings.

What: Write one scheme for hubs, activities, guides, games, printables and packs. Recommendation: keep the shipped `/activity/<slug>/` pattern, since 38 pages are already built, and choose hub slugs before the next 20 pages ship. Every URL type is listed once.

Acceptance:
- One table of URL patterns, each with an example and an owner.
- Any renamed URL has a 301 in the redirect map, with no chains.
- No two URLs serve the same primary content without a canonical.
- The sitemap contains only canonical, indexable URLs (checked by the existing sitemap test in `site/src/lib/sitemap.test.ts`).

Depends on: SEO-005 (old hosts), SEO-008 (intent owners).
Risks / not doing: Do not add keywords to paths for their own sake [SEO.md §4.1].

### SEO-004 · Search consoles and a measurement baseline
Priority P0 · Phase S1 · Status partial · Pillars: all

Why: No ranking or demand claim can be checked without Search Console and Bing data [SEO.md §11.2].

What: Verify the canonical host in Google Search Console and Bing Webmaster Tools. Submit the sitemap index. Use IndexNow only for URLs that were truly added, changed or removed, and never as an indexing guarantee [SEO.md §6.4]. Export impressions for nonbranded queries before new pages go live, so that growth can be measured.

Acceptance:
- Both properties verified for `https://creativeactivities.org`. Verification status recorded in the metrics file.
- Baseline export saved with date.
- Sitemap submission confirmed in both consoles.

Depends on: SEO-003, SEO-005.
Risks / not doing: Do not describe Bing's index as the ChatGPT index. Use Bing data as Bing data [SEO.md §7.1].

### SEO-005 · Migrate from the old domain and old host
Priority P0 · Phase S2 · Status new · Pillars: all

Why: The web strategy was written for `dementiaactivities.games`. The old GitHub Pages site (`streamentry.github.io/golden-moments-web/`) and the old domain still serve. Links and app store URLs point at them [link building, owned links].

What: Map every indexable old URL to its canonical equivalent. Use permanent redirects. Keep the old GitHub Pages notice until the app release, as planned. Update app store website fields, GitHub homepage fields and any outreach that cites the old host. Use Search Console's change-of-address tool only for a property that was verified.

Acceptance:
- A redirect map for every URL that was ever indexed or linked, with each target returning 200.
- No redirect chains. Test with a crawler before cutover.
- Old-host pages that have no equivalent return 404 or 410, not a soft 200.
- Brand text on old pages is not used for search snippets after cutover.

Depends on: SEO-003.
Risks / not doing: Do not redirect everything to the homepage.

### SEO-006 · Page-type rules and the canonical activity
Priority P0 · Phase S2 · Status partial · Pillars: all

Why: "One idea, many adaptations" is the product's core claim [MISSION, "What makes us different" 3]. Separate pages per audience would create near-duplicates [SEO.md §4.1].

What: Adopt the page-type rules in this file as the release standard. Each new page's brief declares its type and its canonical activity.

Acceptance:
- A new variation without substantially different materials, safety or outcome is added as a section of the canonical page, not as a new URL.
- Each brief names the page type and, for activities, the canonical slug.
- A release check fails when two indexable pages have the same title pattern and H1 pattern (see SEO-015).

Depends on: SEO-003.
Risks / not doing: Do not split a page to chase a long-tail phrase.

### SEO-007 · No thin or programmatic pages
Priority P0 · Phase S2 · Status new · Pillars: all

Why: Penalized patterns include mass-generated pages and third-party content on a strong domain [R5 §2.4]. Our risk is a template with noun swaps, which the content-farm objection in [SEO.md §14] predicts.

What: Activity ideas and steps are written by a person. Structured fields (materials, time, setting, energy) may be generated from curated data, but never the idea itself. Each page passes the editorial gate in [SEO.md §13](../../../SEO.md).

Acceptance:
- Minimum bar for indexing: a named author, a materials list, a time estimate, at least one real adaptation, one safety line and a stop note.
- A page that misses the bar is `noindex` until it passes, or it is not published.
- A quarterly uniqueness audit compares steps, images and adaptations across pages. Result recorded in the editorial log.

Depends on: SEO-015, [TSA file](14-trust-safety-accessibility-privacy.md) for review rules.
Risks / not doing: Do not use AI-written activity ideas as if they were tested [SEO.md §5.3].

### SEO-008 · Intent ownership map
Priority P0 · Phase S2 · Status partial · Pillars: all

Why: Two pages compete when two owners claim one intent. The web SEO strategy gives the home page "dementia activities" intent, while the hub plan gives the same intent to a hub [web SEO §"Keyword-to-page map"; SEO-009].

What: One table: intent → owner URL. The home page owns the brand and the broad games intent. Hubs own task intents. Activity pages own specific activity queries. Guides own "how do I" questions with no single activity.

Acceptance:
- Each intent has exactly one owner. A second page for the same intent is a variation, not a rival.
- Reviewed every time a hub is added.
- Results from SEO-002 and Search Console can change an owner only by editing this table.

Depends on: SEO-003, SEO-009.
Risks / not doing: Do not let the home page drift into a catalog of activities.

### SEO-009 · Dementia activities hub
Priority P0 · Phase S1 · Status new · Pillars: CARE (lead), CALM, TOGETHER

Why: Dementia is the wedge for the whole program [VISION "The wedge"; SEO.md §0]. R5 estimates demand as medium to high with a high trust bar, and the cluster is missing from the four shipped hubs [R5 §6 rank 7; baseline].

What: A hub at the slug chosen in SEO-003 for "dementia activities at home". It lists 5 to 12 activities chosen for practical fit: setting, energy, materials, and whether they work sitting or in a group. It explains the selection criteria and the limits. It does not promise cognitive or behavioral benefit and does not sort people by stage.

Acceptance:
- H1 names the job, not a diagnosis. Example: "Dementia activities you can do together at home."
- Each listed activity says why it fits, and at least two differ in materials and setting.
- The page states, in plain words, that activities are for enjoyment and time together and that they are not treatment.
- Byline and review status match SEO-012. Before publication, a credentialed reviewer named in the [README open questions](README.md) signs off the scope (see [R3 §7](research/03-art-therapy-wellbeing.md), "Working with credentialed reviewers").
- No stage-based pages (early, middle, late) until a reviewer has signed off their scope.

Depends on: SEO-008, SEO-012, reviewer named in [README](README.md).
Risks / not doing: Not a medical resource. Do not reuse care-service intent for the title.

### SEO-010 · Seated activities hub
Priority P0 · Phase S1 · Status new · Pillars: CARE, MAKE

Why: Rank 1 in R5 is seated and bedside activities, with fewer strong pages than competitors [R5 §6]. The product's distinct adaptation is seated and bedside use [DESIGN.md §5]. The shipped bedside hub covers only part of the intent.

What: A seated hub with its own criteria: sitting support, table height, one-handed use, energy. Cross-link to the bedside hub and explain the difference in one sentence on each.

Acceptance:
- At least five activities where seated use changes the steps or materials. A label alone does not count.
- No bedside activity appears in the seated hub unless its steps work seated.
- The bedside hub's safety scope is unchanged. Bedside use names fall and tray-use risks.

Depends on: SEO-003, SEO-006.
Risks / not doing: Do not claim better mobility or rehabilitation.

### SEO-011 · Answer block on every activity and hub
Priority P0 · Phase S2 · Status partial · Pillars: all

Why: Answer engines and time-pressed caregivers both need the answer first. Citations favor self-contained pages [R5 §2.5]. "Citations matter more than rank" is R5's own finding, with its uncertainty noted.

What: The first visible text on each activity and hub is a 2 to 3 sentence answer: who it suits, the materials, setup and active time, and one safety line. It is ordinary HTML text, not an image, tab or accordion.

Acceptance:
- Visible without scrolling on a 375px-wide phone.
- Matches the JSON-LD and the printed card.
- Contains no claim beyond enjoyment or time together. See [TSA](14-trust-safety-accessibility-privacy.md) claims policy.

Depends on: [DESIGN.md §5](../../../DESIGN.md) data model.
Risks / not doing: Do not write keyword-stuffed answers. There is no AI-specific format requirement [SEO.md §7.1].

### SEO-012 · Bylines, reviewers and dates
Priority P0 · Phase S2 · Status partial · Pillars: all

Why: E-E-A-T is an evaluation framework, and first-hand experience and authorship matter [R5 §2.5]. Trust is the Definition of #1 [README].

What: Every page shows a named author or a named team with a stated role. A reviewer appears only when a review is recorded in the activity data (`reviewer`, `last_reviewed_at` in [DESIGN.md §5](../../../DESIGN.md)). "Last checked" changes only after substantive work. Keep the current "not yet reviewed by an outside expert" statement until a review exists.

Acceptance:
- No reviewer credential is shown without written permission from that person.
- No date is refreshed automatically.
- Every page's byline matches its record. A CI check fails when a reviewer field is empty but a reviewer badge is rendered.

Depends on: [TSA file](14-trust-safety-accessibility-privacy.md) (editorial review and corrections).
Risks / not doing: Do not invent experts or testimonials [SEO.md §5.3].

### SEO-013 · Structured data policy
Priority P0 · Phase S2 · Status partial · Pillars: all

Why: Markup must match visible content and must not promise rich results. Google narrowed HowTo and FAQ rich results in 2023 [SEO.md §15, FAQ and HowTo changes]. SEO.md recommends not expecting HowTo rich results.

What: Allowed types, each only when true and visible:

- `Organization` and `WebSite`, with verified `sameAs` links only.
- `BreadcrumbList`, matching the visible path.
- `Article` on guides and activities, with real `author`, `datePublished`, `dateModified`.
- `HowTo` on step pages, with the same steps as the page.
- `ItemList` on visible curated collections only (see SEO-043).
- `VideoObject` only for a real video with a transcript (see SEO-044).

Not allowed: `Review`, `AggregateRating` without real collected ratings, `Recipe` for non-recipes, and `FAQPage` added for markup alone.

Acceptance:
- A build check compares JSON-LD names and steps with the rendered HTML.
- Validators pass: Rich Results Test on release, Schema Markup Validator for semantics [SEO.md §6.3].
- No empty or placeholder fields in published output.

Depends on: SEO-012.
Risks / not doing: Do not describe markup as an AI-search feature.

### SEO-014 · Internal linking graph
Priority P0 · Phase S2 · Status partial · Pillars: all

Why: Crawlers and visitors find activities through links, not through search boxes. Orphans are invisible [SEO.md §4.2, §6.1].

What: Home links to hubs. Hubs link to activities with descriptive anchors. Each activity links to its parent hub, its printable, two or three functionally related activities and one next step for a visitor whose first choice did not fit.

Acceptance:
- Every indexable page has at least two crawlable internal links.
- No anchor text reads "learn more" or "read more" more than once per page.
- Navigation and filters work without JavaScript for the list of activities. The finder may add interactivity on top.
- A CI orphan check passes on every release.

Depends on: SEO-003.
Risks / not doing: Do not link by keyword similarity alone. Related activities are chosen by function [SEO.md §4.2, §4.3].

### SEO-015 · Duplicate and near-duplicate audit
Priority P0 · Phase S2 · Status new · Pillars: all

Why: Mass-similar pages are the main risk the strategy names [SEO.md §14; VISION counter-metrics]. Duplication should be caught before it ships, not in a quarterly review.

What: A release check compares titles, H1s, descriptions and body text across indexable pages. It reports pairs above a similarity threshold that the editors set in the first audit. The report blocks release until each pair is rewritten, merged or marked as a deliberate variation.

Acceptance:
- Threshold and method recorded in the repo. No threshold is chosen without a sample review.
- Output lists each flagged pair with a decision.
- Title templates may repeat only where the subject differs.

Depends on: SEO-007.
Risks / not doing: Do not optimize for passing the check. A rewrite must add content, not synonyms.

---

## P1 items

### SEO-016 · Reminiscence hub (non-clinical)
Priority P1 · Phase S2 · Status new · Pillars: CARE, CALM, TOGETHER

Why: R5 ranks reminiscence third, with App Store reminiscence apps already ranking [R5 §3.1, §6]. Some of the wording is clinical in other sources, so the frame must be ours.

What: A hub about talking and sharing memories through photos, objects and songs, with a neutral frame. It avoids brain-training wording and the word "therapy". Activities invite stories without requiring disclosure.

Acceptance:
- No claim that reminiscence improves memory, mood or cognition.
- Any activity that invites personal disclosure carries a visible stop note and crisis route (see [TSA file](14-trust-safety-accessibility-privacy.md) and [R3 §4.4](research/03-art-therapy-wellbeing.md)).
- No prompt asks someone to recall a loss or diagnosis.

Depends on: SEO-008, SEO-012.
Risks / not doing: Do not run reminiscence as a memory exercise. The App Store brain-training pattern is what we avoid [R4 §7].

### SEO-017 · Crafts for limited hand strength or arthritis
Priority P1 · Phase S2 · Status new · Pillars: MAKE, CARE

Why: Adaptation is the differentiator; few sites explain grip and tool changes [R5 §6 rank 2].

What: An adaptation matrix (grip size, tool alternatives, pre-cut shapes, no-adhesive options) applied to existing activities, with a dedicated hub for the intent.

Acceptance:
- At least five activities each show a documented grip or tool variation.
- Each variation has been tried by a person or reviewed by someone with an occupational or hand-therapy background, with the scope stated. The page does not claim rehabilitation.
- Hub and activity pages share the same adaptation data.

Depends on: SEO-010, [CRAFTING](07-pillar-crafting.md) pillar file.
Risks / not doing: Do not describe adaptations as treatment for arthritis.

### SEO-018 · Grandparent and grandchild expansion
Priority P1 · Phase S2 · Status partial · Pillars: TOGETHER, GROW, CARE

Why: The hub exists. R5 ranks the cluster fifth, with the intent of shared-moment framing [R5 §6].

What: Add activities that work across two generations, with adjustable steps for each person, and age-neutral wording.

Acceptance:
- At least eight activities marked for two generations.
- No child's name, face or data in examples. Child-facing images need a release (see [TSA file](14-trust-safety-accessibility-privacy.md)).
- No claim about child development.

Depends on: [GROW](08-pillar-parenting-kids.md) pillar file, [TSA file](14-trust-safety-accessibility-privacy.md) children section.
Risks / not doing: Do not build a separate children's section here.

### SEO-019 · Measure AI discovery and citations
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Citations are the signal that matters most for answer engines [R5 §2.5], but they are noisy. The strategy needs a repeatable measure, not a vendor score [SEO.md §7.4].

What: Use Bing AI Performance and any Search Console generative AI report that the property shows. Run a fixed-prompt benchmark of 20 to 30 caregiver questions per launched locale, on a fixed schedule. Record whether the answer cites us, cites a competitor, is inaccurate, or gives the answer without a link.

Acceptance:
- Benchmark sheet with date, prompt set version and results.
- No vendor "AI visibility score" used as a KPI.
- Any inaccurate AI answer about our activities is logged and sent to the editor (see [TSA file](14-trust-safety-accessibility-privacy.md), corrections).

Depends on: SEO-004.
Risks / not doing: Do not optimize for specific bot behavior. Do not inject text meant only for machines [SEO.md §7.3].

### SEO-020 · Referral and app attribution
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: The owner reports traffic from ChatGPT, but site-to-install is unmeasured [web SEO, "AI answer engines and app installs"].

What: Report referrals separately: Google Search, AI referral (for example, `chatgpt.com`), App Store Search, and direct. Use App Store Connect campaign tokens on store links, as the web SEO strategy describes. Compare sessions with outbound app-store clicks. Any analytics tool is subject to the analytics inventory in [TSA](14-trust-safety-accessibility-privacy.md).

Acceptance:
- Source breakdown is visible in one report.
- The report does not claim a one-to-one link between clicks and installs [SEO.md §10].
- No personal data in campaign parameters.

Depends on: SEO-004, TSA analytics inventory.
Risks / not doing: Do not add a tracker to measure this. Use the measurement the TSA file allows.

### SEO-021 · Web-to-app bridge test
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: The app earns a call to action only where it adds something the web cannot [SEO.md §10]. Shipped as `AppCta` on game and guide pages.

What: Keep the contextual call to action, "Prefer an offline set of activities? Try the free app," on pages where offline packs or saved plans are real. Run a causal test: a cohort of comparable pages with the CTA and a cohort without. Keep the primary web activity available in both.

Acceptance:
- Test design and result recorded.
- If the activity-start proxy or the print and save rate drops with the CTA, remove the CTA.
- The CTA lists only released app features, kept in step with `site/src/lib/app.ts` and the store metadata.
- No pop-up or interstitial before the first activity [DESIGN.md §9].

Depends on: SEO-020, [metrics](17-metrics-and-evidence.md).
Risks / not doing: Do not gate any activity behind the app.

### SEO-022 · Printable card as a link and share asset
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Printables travel offline and need no account [R5 §4]. Craft platforms monetize downloads or push purchases, so a free, no-account printable is an open position [R1 §6, item 3]. The print card with QR is in the baseline, and the packs are the two shipped examples.

What: Every printable has a stable URL, a QR code to its canonical page, a version and date on the print, and a license line. A4 and US Letter variants where both are used. Printed copies cannot be updated, so the version line matters [R5 §4].

Acceptance:
- Print CSS tested on A4 and US Letter in the launched languages (see [localization](13-localization.md)).
- QR code resolves to the canonical page, not the homepage.
- No required watermark on a family's finished work [VISION].

Depends on: SEO-003, [L10N](13-localization.md) paper sizes.
Risks / not doing: Do not put the printable behind a sign-up.

### SEO-023 · YouTube Shorts demonstrations
Priority P1 · Phase S2 · Status new · Pillars: all

Why: YouTube is among the most-cited sources in AI answers [R5 §2.5]. Short demonstrations show adaptations that text cannot.

What: One short per activity, showing the real process and at least one adaptation on screen. Captions on by default. Each description links to the canonical page. Longer dementia-care demonstrations need a reviewer.

Acceptance:
- Faces of people with dementia or children appear only with written consent or a release [R5 §4; TSA file].
- Each video has a transcript on the activity page.
- Made-for-kids labels are set accurately on any child-directed video [R5 §5.1].

Depends on: SEO-011, [TSA file](14-trust-safety-accessibility-privacy.md).
Risks / not doing: Do not chase view counts. The metric is activity starts [VISION].

### SEO-024 · Pinterest pins
Priority P1 · Phase S2 · Status new · Pillars: MAKE, GROW, CARE

Why: Pinterest had 661M monthly users in Q3 2026, and its search is planning-oriented [R5 §2.1, §4]. Pins outlast search for visual ideas.

What: One pin per activity, with a vertical image and a title that matches the search phrase in SEO-002. A board per situation, such as dementia at home or grandparent visits. The printable is pinned separately. Use rich pin metadata only where Pinterest's current documentation supports that pin type. This needs verification before it is built.

Acceptance:
- Pins link to canonical pages only.
- No fake saves, comments or engagement.
- Generic "crafts" pins are not used; each pin names a specific situation.

Depends on: SEO-002, SEO-022.
Risks / not doing: Pinterest search is not Google search. Do not assume that Google data predicts pin demand [R5 §4].

### SEO-025 · Partner distribution
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Libraries, care homes, OT and AT educators, and national Alzheimer's associations already reach our users [R5 §4; language markets §4].

What: Offer each partner type one fit-specific resource: a library programming sheet, an "activity of the week" sheet for activity directors, a facilitator note for intergenerational programs. Ask for feedback. Target national associations in the markets that are launched (list in [language markets §4](../../plan/language-markets.md)).

Acceptance:
- No logo or endorsement used without written permission from the organization.
- No claim that a partner recommends the site unless it has said so in writing.
- Every outreach email is approved by the maintainer before it is sent [link building rules].
- Pitches name the specific page and gap, as in the link-building log.

Depends on: [link building](../../strategy/link-building.md) log, the `/for-organizations/` page.
Risks / not doing: Do not frame care homes as the audience for a care plan. Activities are not care plans [R5 §4].

### SEO-026 · Opt-in email digest
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Email is the only channel the program owns, and it works without ad tech [R5 §4].

What: An opt-in digest organized by situation (not age or diagnosis). One activity per email. One-click unsubscribe. Confirmed opt-in.

Acceptance:
- No birth date, diagnosis or location collected for targeting.
- No streak, countdown or urgency copy.
- Provider data processing agreement signed and retention set in the TSA file.
- A one-click unsubscribe in every email, with no login.

Depends on: [TSA](14-trust-safety-accessibility-privacy.md) privacy items, [business model](16-business-model.md).
Risks / not doing: Not a feed. No re-engagement sequences.

### SEO-027 · Earned links through usefulness
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Independent links come from pages people already use [SEO.md §9.2; link building].

What: Keep the outreach rules and log in [link building](../../strategy/link-building.md). Linkable pages are `/for-organizations/`, `/handout/`, trivia, printable and bingo. Open activity packs (SEO-045) are the stronger asset once licensed.

Acceptance:
- Every pitch names the page and the gap it fills.
- No paid links, link exchanges, guest-post buys or comment spam.
- At most one follow-up after two weeks, and stop if a site asks.
- Outreach log kept current.

Depends on: SEO-045.
Risks / not doing: Do not pitch the 11 prospects again without a new gap.

### SEO-028 · Core Web Vitals and performance budgets
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Mobile and low-bandwidth users are the primary audience [DESIGN.md §6, §7].

What: Track field data at the 75th percentile: LCP at or under 2.5 s, INP at or under 200 ms, CLS at or under 0.1 [DESIGN §7; SEO.md §6.1]. Set JavaScript and CSS budgets per page type from the web performance rules (user's global rules, `web/performance.md`). Confirm which budget applies to activity pages, since the budgets differ by page type.

Acceptance:
- Field data collection in place. Lab checks in CI.
- Activity template passes its budget before release.
- No third-party script on activity pages (see [TSA](14-trust-safety-accessibility-privacy.md)).

Depends on: [PLAT file](15-platform-data-architecture.md).
Risks / not doing: Do not trade accessibility for speed effects [performance rules].

### SEO-029 · Canonical and parameter policy
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Filter states and print views create duplicates. Wrong canonicals hide good pages [SEO.md §4.1, §6.1].

What: Filter URLs are not indexed unless one becomes a curated page with stable demand. Print views canonicalize to the activity. PDFs do not compete with HTML where a canonical header is practical. Translated pages canonicalize to themselves, never to the English page.

Acceptance:
- A crawl report shows no canonical chains and no canonical to a different-language page.
- Finder parameters are `noindex` or excluded, and tested.

Depends on: SEO-003.
Risks / not doing: Do not blanket-canonicalize materially different pages.

### SEO-030 · Locale indexing gate
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Machine-made translations that are indexed look like thin content at scale. The plan keeps unreviewed languages out of search [plan README; web SEO §6].

What: Only languages on the reviewed list go into sitemaps and `hreflang`. Unreviewed languages are excluded or `noindex`. The web SEO strategy also says to set `noindex` three months after verification for any language with no indexed pages or no impressions.

Acceptance:
- Sitemap test passes for reviewed locales only.
- Review status is read from one source (`REVIEWED_LANGUAGES` in `site/src/i18n/locales.ts`, per the native review guide).
- The three-month rule is applied on a dated schedule.

Depends on: [localization](13-localization.md) review gates.
Risks / not doing: Do not index a language to see if it ranks.

### SEO-031 · Hreflang implementation
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Language alternates help the right page reach the right reader only when they are reciprocal and exact [SEO.md §8.1].

What: Self-referencing canonical on each reviewed locale page. Reciprocal `hreflang` links to exact equivalents. `x-default` only where useful. The language switcher is visible. No redirect by IP address.

Acceptance:
- Automated test checks reciprocity for every reviewed page pair.
- Middleware reviewed to confirm no IP-based redirect (`site/src/middleware.ts`).
- Mappings built from content IDs, not string replacement.

Depends on: SEO-030, [localization](13-localization.md).
Risks / not doing: Do not hreflang a page with a partial translation.

### SEO-032 · Local search phrase research
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Local phrases differ from English ones, and Search Console data is the only reliable check [web SEO §5 and §6].

What: Use the local phrase lists in [language markets §5](../../plan/language-markets.md) as hypotheses. Read Search Console and Bing impressions per market 6 to 8 weeks after verification, then re-rank. Re-rank with data, not the 2026-11-08 table.

Acceptance:
- Impressions by market and page type recorded.
- A decision table per market: focus, hold, skip, with the data behind it.
- No volume figure published without a source.

Depends on: SEO-004, SEO-030.
Risks / not doing: Do not chase the Korean or Simplified Chinese terms that carry stigma [language markets §1].

### SEO-033 · App store optimization per locale
Priority P1 · Phase S2 · Status partial · Pillars: all

Why: Store search drives app installs, and each storefront indexes its own keywords [language markets §2].

What: Each launched storefront gets a name, subtitle and keywords that use the phrase a family would type. The store listing claims match the plan (enjoyment and time together, no cognitive claims). Google Play machine-translates ten languages, so a supplied translation must replace the machine one. Screenshots are localized only for reviewed languages.

Acceptance:
- Tier 1 review (store listing) done before anything is pasted into a console [native review guide].
- No claim about cognition, memory, agitation or disease in any locale.
- Keyword field use is recorded per storefront.

Depends on: [localization](13-localization.md), [app features](04-features-app.md).
Risks / not doing: Do not treat store-search volume as web-search volume.

### SEO-034 · llms.txt kept accurate
Priority P1 · Phase S2 · Status exists · Pillars: all

Why: The baseline lists `llms.txt` as shipped. SEO.md says it is optional and is not a Google visibility tactic [SEO.md §7.1, §7.3].

What: Keep it short and factual. Generate its app facts from the single source in `site/src/lib/app.ts`. Describe only released features.

Acceptance:
- Matches the store metadata and the app facts source.
- Contains no unreleased feature and no claim outside the claims policy.
- Reviewed on each release.

Depends on: [TSA](14-trust-safety-accessibility-privacy.md) claims policy.
Risks / not doing: Do not expand it into a keyword list.

### SEO-035 · AI crawler policy
Priority P1 · Phase S2 · Status new · Pillars: all

Why: Search crawling and model training are separate controls [SEO.md §6.2]. The 2026-10-30 check showed everything allowed, including GPTBot. No one has decided the training question.

What: Write a decision for each named crawler: search (OAI-SearchBot, Bingbot, Googlebot) and training (GPTBot and others). Record the reason. Verify the CDN and WAF pass each crawler.

Acceptance:
- Written decision with an owner and date.
- Each crawler tested with a live request after any change.
- Googlebot and Bingbot are never blocked when organic visibility is the goal.

Depends on: maintainer decision.
Risks / not doing: Do not treat `robots.txt` as access control [SEO.md §6.2].

---

## Table items (P1 to P3)

| ID | Item | Priority · Phase · Status | What and acceptance | Depends on |
| --- | --- | --- | --- | --- |
| SEO-036 | Holiday and seasonal pages (R5 rank 6) | P2 · S2 · new | Evergreen core with a dated seasonal layer. Holidays come from each locale's calendar, not a US default ([localization](13-localization.md)). Acceptance: no page assumes one holiday. | SEO-009 |
| SEO-037 | Music activities for seniors (R5 rank 10) | P2 · S2 · new | Creative, non-listening versions such as making a playlist together. Acceptance: no claim about music and mood beyond enjoyment ([R3 §5](research/03-art-therapy-wellbeing.md)). | [CARE](09-pillar-older-adults-dementia.md) |
| SEO-038 | Life-story and storytelling (R5 rank 11) | P2 · S3 · new | Low volume, strong fit. Acceptance: prompts ask about objects and everyday things, not loss or diagnosis; crisis route if disclosure is invited. | SEO-016 |
| SEO-039 | Relaxing art for adults (R5 rank 9) | P2 · S3 · new | Scoped wording: "relaxing art activities." Acceptance: no "therapy," "healing," or "treatment" wording; non-therapy statement on page; sits under [CALM](10-pillar-creative-wellbeing.md) rules. | [CALM](10-pillar-creative-wellbeing.md) |
| SEO-040 | Sensory activities for children (R5 rank 12) | P3 · S3 · new | Gated. Starts only after the children's controls in the TSA file are live and the GROW pillar has evidence. Acceptance: no child accounts, no child data, no third-party ads. | [GROW](08-pillar-parenting-kids.md), [TSA file](14-trust-safety-accessibility-privacy.md) |
| SEO-041 | Broad rainy-day and adult or kids' crafts (R5 ranks 13 to 15) | P3 · S3 · new | Hub-only links, no dedicated pages until an adaptation angle is proven. Acceptance: each page would pass SEO-007. | SEO-007 |
| SEO-042 | FAQPage on visible questions | P2 · S2 · partial | Only where real questions are visible on the page. Not added to every page for markup. Acceptance: validator passes; questions match visible text. | SEO-013 |
| SEO-043 | ItemList on curated collections | P2 · S2 · partial | Hubs and printable packs with visible lists. Acceptance: the list order is on the page. | SEO-013 |
| SEO-044 | VideoObject on real videos | P2 · S2 · new | Only with a transcript on the page. Acceptance: metadata matches the video. | SEO-023 |
| SEO-045 | Open activity packs with a license | P2 · S2 · new | Packs with safety notes, substitutions and a source URL, under a license chosen with counsel. Acceptance: license line on every page of the pack; no pack without a safety line. | SEO-022, [TSA](14-trust-safety-accessibility-privacy.md) |
| SEO-046 | Case stories with recorded data | P3 · S3 · new | Published only with recorded consent and real data. Acceptance: no invented quotes or outcomes [SEO.md §5.3]. | [metrics](17-metrics-and-evidence.md) |
| SEO-047 | HowTo markup on step pages | P1 · S2 · partial | Keep valid markup on activities that have visible numbered steps. Acceptance: JSON-LD steps match visible steps; no rich-result promise (see SEO-013). | SEO-013 |

---

## Open questions

1. **URL scheme (SEO-003).** Three documents disagree on hub and activity paths. Which one is final?
2. **Which lens sets priority?** R5 ranks clusters with a US-first view. The 2026-11-08 Bing measurement puts Japanese, Spanish, Portuguese and Italian first. Both are judgment or partial data. Choose one after SEO-002 and SEO-032 data.
3. **Domain and brand.** The web SEO strategy was written for `dementiaactivities.games` under the name Golden Moments. The site is now Creative Activities at `creativeactivities.org`. Any remaining references to the old name in copy need an audit ([localization](13-localization.md) rename check).
4. **Analytics.** The web SEO strategy refers to GA4. [DESIGN.md §7](../../../DESIGN.md) forbids third-party trackers. Confirm which analytics are live before SEO-020 is built.
5. **Training crawler.** Who decides GPTBot (SEO-035)?
6. **Credentialed reviewer.** SEO-009 cannot ship its dementia hub without a named reviewer. The README lists this as open.
7. **Unverified claims in R5.** R5 flags several items as needing verification: the EEA site reputation change, the October 2026 AI-accuracy revision, and some AI Overviews figures [R5 §2.4, §2.5]. Verify before any decision depends on them.
