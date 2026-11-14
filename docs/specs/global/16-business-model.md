# 16. Business model: sustaining a free core

This file sets out how creativeactivities.org and the Creative Activities app could pay for their work without weakening the free core. The core is every activity, guide, game and basic printable, with no login and no paywall ([MISSION.md](../../../MISSION.md) point 7; [DESIGN.md §9](../../../DESIGN.md)). Items are `BIZ-###`. Each candidate lists the evidence needed before anyone tries it. No item is approved, and no revenue figure here is a forecast.

**Read with:** [README](README.md) · [platform and data](15-platform-data-architecture.md) · [metrics](17-metrics-and-evidence.md) · [content library](06-content-library.md) · [community and UGC](11-community-ugc.md) · [trust, safety, accessibility and privacy](14-trust-safety-accessibility-privacy.md) · [roadmap](18-roadmap.md) · `docs/specs/product.md` · `docs/plan/README.md` §6

Research notes are cited as [R1] craft platforms, [R2] parenting and kids, [R3] art therapy and wellbeing, [R4] games and engagement, [R5] search, scale and trust.

---

## 1. Where the money stands today

- **Revenue:** none. The plan says the app's payers are "nobody today" ([docs/plan/README.md](../../plan/README.md) §6).
- **Costs:** small. The plan lists Apple's annual developer fee, a domain and Cloudflare static hosting. There is no acquisition spend ([docs/plan/README.md](../../plan/README.md) §6).
- **Constraint:** founder time. The plan says to favor work that compounds, such as indexed pages and ratings.
- **Boundary:** `docs/specs/product.md` says payments require explicit approval, and the plan keeps "payments, accounts, backend and AI" out until the day-90 gates. Nothing in this file lifts those boundaries.

**The two business documents disagree.** [docs/strategy/category-leader.md](../../strategy/category-leader.md) recommends a "Family Plus" subscription and gives illustrative revenue scenarios for a dementia-care product. The plan's verdict (§6) is that a subscription is "no": 12% of caregivers in a 2026 convenience survey would pay out of pocket, and surprise subscriptions are the category's top complaint. [R4 §7] also records that Memory Lane Games' subscription is its top stated drawback. This file follows the plan and the mission, marks subscriptions as not adopted, and lists the conflict as an open question. The scenarios in the strategy document are planning models, not evidence.

**Order of tests.** Set the cost ledger first (BIZ-005), then test supporter membership (BIZ-006) and printed packs (BIZ-007). Institutional and grant work follows once the S2 evidence exists ([roadmap](18-roadmap.md)).

---

## 2. Items

Summary: 18 items. P0 6, P1 5, P2 5, P3 2. Blocks are used for P0 and P1 items; tables are used for the rest.

### Commitments (what we never do)

### BIZ-001 · Free core, forever
Priority P0 · Phase S1 · Status exists · Pillars: all
Why: "Free core value" is one of the seven differences in MISSION. A paywall on essentials would put the people who most need help behind a payment. [R2 §7] and [R1 §7] both warn that paywalled core libraries lose trust.
What: every activity, guide, game and basic printable stays free, with no login. Paid items are additions, never replacements.
Acceptance:
- A test lists every core route and confirms none requires a login or payment.
- Every paid item in this file has a free equivalent for the same need (for example, a free printable card for each paid pack).
- Copy on any paid item says what stays free.
Depends on: none.
Risks / not doing: "freemium" pressure from a funder or partner. Any proposal that gates a core route is rejected without review.

### BIZ-002 · No ads inside activities, games or child-directed pages
Priority P0 · Phase S1 · Status exists · Pillars: all
Why: DESIGN §9 bans ads that look like instructions. [R4 §7] names interstitial and rewarded ads as poor fits for dementia and childhood audiences. [R2 §7] notes that ad-supported kids' surfaces are a trust failure. The site's GA4 setup has ad personalization off ([site/README.md](../../../site/README.md)).
What: no ads on activity, game, hub or guide pages, and none on any page a child can reach. No advertising SDK in the app.
Acceptance:
- Audit of the built site finds no ad network script, pixel or iframe.
- The CSP blocks all ad domains.
- The app's dependency list has no advertising SDK.
Depends on: [trust, safety, accessibility and privacy](14-trust-safety-accessibility-privacy.md).
Risks / not doing: contextual sponsorship that looks like ads. See BIZ-013.

### BIZ-003 · No sale or sharing of personal or health data
Priority P0 · Phase S1 · Status exists · Pillars: all
Why: DESIGN §9 bans selling sensitive participant information. [R5 §5.2] notes that health information is special-category data under GDPR. [R1 §7] warns that pinning monetization on behavior data drifts a platform toward paid placement.
What: no sale of data, no sharing with data brokers, no data used for ad targeting, and no use of health context for any commercial purpose. Aggregate reports to partners contain no individual data.
Acceptance:
- The privacy page says so in plain words and matches the configured analytics.
- Every partner or license contract contains a no-resale clause.
- Partner reports suppress small cells ([metrics](17-metrics-and-evidence.md)).
Depends on: [platform](15-platform-data-architecture.md) PLAT-026.
Risks / not doing: "anonymized" data sales. Anonymization is not enough for health-adjacent data, so none is sold.

### BIZ-004 · No paid placement, paid reviews or paid endorsements
Priority P0 · Phase S2 · Status new · Pillars: all
Why: [R5 §4] says partner logos and endorsements need written permission, and that review incentives must not be used. [R1 §7] shows marketplace listings drifting toward paid placement.
What: no company, product or partner can pay to rank, to be listed as a recommended activity, or to have its name on an activity. Partner listings are chosen editorially. No one is paid or given goods in return for a review, rating or testimonial.
Acceptance:
- Written policy published on the editorial policy page.
- Every partner logo carries a written permission record.
- No testimonial is published without the speaker's consent.
Depends on: none.
Risks / not doing: "featured" slots sold to partners. Not allowed.

### BIZ-005 · Economic baseline and 12-month cost ledger
Priority P0 · Phase S2 · Status new · Pillars: all
Why: the plan says "no revenue scenario is given: it would be invented" ([docs/plan/README.md](../../plan/README.md) §6). Without a cost ledger, no revenue item can be judged.
What: a single ledger of every recurring and one-off cost: Apple fee, domain, hosting, storage, image processing, translation and review fees, print, postage, and stipends. Reviewed monthly. Each cost line has an owner.
Acceptance:
- The ledger covers the last 12 months and the next 12 as planned.
- Each line says whether the cost is fact (invoice), estimate (method stated) or unknown.
- The sustainability target is written as a target: "core costs covered by named non-core income by a set date".
Depends on: [platform](15-platform-data-architecture.md) PLAT-040 (cost tracking).
Risks / not doing: estimates shown as facts. Mark each line.

### Supporter, print and sales

### BIZ-006 · Optional supporter membership (one-time or monthly)
Priority P1 · Phase S2 · Status new · Pillars: all
Why: the plan's counterargument is that "a small share will pay once" ([docs/plan/README.md](../../plan/README.md) §6). [R2 §3] shows free content with an optional paid layer working when the free depth comes first.
What: a plain "support this work" page with a one-time or monthly donation. Supporters get a thank-you, an optional name in a supporters list (opt in), and nothing that changes the content. No nagging, no reminders, no countdowns, and no guilt copy.
Acceptance:
- The core library is unchanged for every visitor, supporter or not, and the test in BIZ-001 still passes.
- A donation can be cancelled in one step.
- No pop-up or banner asks for support on a first visit.
- Payments handled by a provider that stores no health context.
Depends on: a maintainer decision to lift the payments boundary (`product.md`).
Evidence needed before trying: interviews with 10 returning households and 10 organizations on what they would pay for and why; a stated baseline of return visits (from [metrics](17-metrics-and-evidence.md)). Proposed target to decide before launch: at least 30 supporters before any recurring offer is shown.
Risks / not doing: donations that pressure families. Donations never appear inside an activity.

### BIZ-007 · Printed packs and collections (one-time purchase)
Priority P1 · Phase S2 · Status new · Pillars: all
Why: printed collections are a proven category for craft and parenting sites ([R1 §3]; [R2 §3]). The printed item adds value that the free print does not: paper quality, binding, large print, and a physical object to give away. Printing is also a distribution path ([VISION.md]).
What: a one-time purchase of a printed pack (for example, "five quiet bedside activities", large print) with the same content as the free printable. The free printable stays free and complete. No subscription, no auto-renewal, and no membership needed to buy.
Acceptance:
- Free and paid versions have the same content and the same version number ([platform](15-platform-data-architecture.md) PLAT-007).
- Checkout shows total price, shipping and return terms before payment.
- Unit cost and margin are recorded in the cost ledger (BIZ-005).
- No content is printed that is not also free online.
Depends on: a fulfillment partner (decision); the payments decision.
Evidence needed before trying: 20 printed samples handed to activity staff and families, with reorders or repeat requests recorded; a fulfillment quote; a unit cost that leaves room for the free print. Proposed target: break-even on print and postage before any stock is ordered in volume.
Risks / not doing: [R1 §7] says product churn and lock-in hurt trust. Do not use subscriptions or plans; do not stop selling a printed version without a notice period.

### BIZ-008 · Printed book with a reviewed collection
Priority P2 · Phase S3 · Status new · Pillars: MAKE, CARE, GROW
Why: [R1 §3] shows teacher-led depth at a predictable price (Domestika, Skillshare). A book is one way to sell depth without paywalling the library.
What: a book of 40 to 60 reviewed activities with variations, sourced to the library and marked with version and review dates. Sold through a publisher or print partner. Revenue goes to the library.
Acceptance:
- Every activity in the book is `native-reviewed` or reviewed by a named reviewer.
- The book adds no content the library does not have, and says so.
- Sales do not change any activity's ranking or availability.
Evidence needed before trying: BIZ-007 sell-through; a publisher's written terms; a reviewed set of at least 40 activities.
Risks / not doing: books that look like clinical guidance. Use the non-clinical wording rules from [R3 §5].

### Institutions and partners

### BIZ-009 · Institutional license for planning and training tools
Priority P2 · Phase S3 · Status new · Pillars: CARE, TOGETHER
Why: care homes, schools and libraries run activity programs. [R5 §4] describes activity directors as a natural feedback loop. [docs/strategy/category-leader.md] names institutional buyers, but its numbers are illustrative only.
What: a paid license for planning features that organizations need: a program calendar, printable packs with the organization's own schedule, staff notes (no resident health data), and training material for facilitators. The library itself stays free for everyone.
Acceptance:
- No library content is behind the license.
- No health data about residents is stored or required.
- A license can be ended with data export.
- An organization can run the free library without a license.
Depends on: planning features (not built); [platform](15-platform-data-architecture.md) PLAT-030 and PLAT-031 if sharing is needed.
Evidence needed before trying: interviews with 10 activity directors or equivalents; 3 paid pilots at a stated price with usage data; a clear list of features they would pay for that are not free. Proposed target: 3 pilots renewed before any second-year pricing.
Risks / not doing: sales that imply clinical endorsement. No claims that the license improves outcomes.

### BIZ-010 · Library and community program licenses for bulk printing
Priority P2 · Phase S3 · Status new · Pillars: all
Why: [R5 §4] lists public libraries as a trusted local channel. A library system can buy printing and promotion, not content.
What: a license that covers printed packs in bulk, a program guide for staff, and training. Library logos appear only with written permission.
Acceptance:
- Written permission for every logo.
- No claim of endorsement without it ([R5 §4]).
- The free print remains available to all.
Evidence needed before trying: a letter of intent from at least one library system, and a fixed print run plan.
Risks / not doing: exclusive deals. No exclusivity.

### BIZ-011 · Grants and philanthropy under a written grant policy
Priority P1 · Phase S2 · Status new · Pillars: all
Why: the plan lists grants as a candidate ([docs/plan/README.md](../../plan/README.md) §6). Grants can fund reviewers, translation review and evidence work. [R5 §2.3] makes native review a precondition for publishing translations, so that cost is unavoidable.
What: grants fund review, translation review, accessibility testing and research. A grant policy sets: no funder controls editorial content or conclusions; no sharing of user data; funders listed publicly; a cap on any one funder's share of income (proposed 30%, to be decided by the maintainer).
Acceptance:
- The grant policy is published before the first application.
- Every grant has a one-page statement of what the money buys.
- Funders are listed with amounts above a set threshold.
Evidence needed before trying: a costed plan for reviewer and translation review; a list of 10 funders with fit assessed; a maintainer decision on the cap.
Risks / not doing: grants that require outcome claims. Decline them.

### BIZ-012 · Research and evaluation funding
Priority P1 · Phase S2 · Status new · Pillars: CALM, CARE, GROW
Why: [R3] and [R4 §5] show that outcome claims in this field often outrun the evidence. Independent research is the only honest route to any outcome claim.
What: funding for pre-registered studies run with a research partner, with the funder unable to change conclusions and publication guaranteed whatever the result. Studies are listed in [metrics](17-metrics-and-evidence.md) MET-032.
Acceptance:
- Protocol pre-registered before data collection.
- Ethics approval recorded.
- Publication agreement signed before money changes hands.
- Negative results are published.
Evidence needed before trying: a named research partner, an ethics route, and a protocol that uses only consented, non-health-tracking measures.
Risks / not doing: studies that look like therapy trials. Activities are not tested as treatments unless a credentialed team runs the study ([R3 §4.2]).

### BIZ-013 · Sponsorship rules
Priority P2 · Phase S3 · Status new · Pillars: all
Why: sponsorship is common in craft and parenting content ([R1 §2]; [R2 §2]). It risks trust unless the rules are strict.
What: sponsorship only on non-activity pages (for example a yearly report), clearly labelled "Sponsored", with no sponsor product in any materials list, step, safety note or variation. No sponsors on child-directed pages. No sponsors of medical, mobility or dementia-care products.
Acceptance:
- The sponsorship policy is published.
- An audit each quarter finds zero sponsor influence on content.
- Sponsors are listed with amounts.
- A sponsor can be ended and the page removed within a stated period.
Evidence needed before trying: an audience large enough to sell to (from [metrics](17-metrics-and-evidence.md)); a sponsor with a fit that passes the policy.
Risks / not doing: sponsored activities. Never.

### BIZ-014 · Affiliate links (only if evidence supports them)
Priority P3 · Phase S3 · Status new · Pillars: MAKE, GROW
Why: materials lists send people to shops. Affiliate income is common in craft publishing ([R1 §2]). It can also tempt a recommendation toward a product that earns commission.
What: "where to buy" links only, on the materials list, always beside a free or household substitution. Disclosed on the page. Never in steps, safety notes, variation text, child-directed pages, or pages on medical, mobility or dementia-care products. Commission never changes a ranking or a recommendation.
Acceptance:
- Every affiliate link has a substitution in the same list.
- The disclosure is on the same page and is visible.
- An editorial audit compares recommendations with and without commission.
Evidence needed before trying: a six-month test with disclosure and complaint tracking; complaints and return visits compared with the control period. Proposed stop rule: end the program if complaints rise or return visits fall.
Risks / not doing: affiliate for children's products without review. Not allowed.

### BIZ-015 · App premium only for genuinely new features
Priority P2 · Phase S4 · Status new · Pillars: all
Why: the plan says a one-time unlock for extra packs may be tested after day 90 ([docs/plan/README.md](../../plan/README.md) §6). [R4 §7] lists subscription walls and surprise charges as the pattern users resent most.
What: a one-time purchase for new, extra features only. Core picture matching, photos on the device, reminders, and the bundled packs stay free. Subscriptions are not used. Any purchase follows Apple and Google rules and shows the price and what is included before the purchase.
Acceptance:
- Every current feature is still free.
- Purchase screen states the price, what is included, and how to restore it.
- App Review notes describe the purchase.
- The `product.md` rule on payments is followed.
Evidence needed before trying: the day-90 gates; asking 10 organizations and 20 returning families what they would pay, as the plan requires ([docs/plan/README.md](../../plan/README.md) §6).
Risks / not doing: an app premium that removes content from the free version. Never.

### BIZ-016 · Paid review and translation as a cost line
Priority P1 · Phase S2 · Status new · Pillars: all
Why: [R5 §2.3] says translation needs native review, and [R3 §7] says clinical content needs credentialed review. Unpaid review does not scale and risks quality. [R5 §2.1] describes Khan Academy's volunteer translation with reviewers as a plausible model, but Khan's content is not health-adjacent.
What: reviewers and native-speaker reviewers are paid per item at a stated rate. Volunteer work is welcomed for community translation of low-risk content. Health and safety content is reviewed by paid, credentialed reviewers only. The rate and cost per reviewed page go into the ledger.
Acceptance:
- A written reviewer rate card.
- Cost per reviewed page is reported monthly.
- No health-adjacent content published with volunteer review only.
Evidence needed before trying: a measured cost per reviewed page from one pilot language; reviewer feedback on the process.
Risks / not doing: reviewers recruited without checking credentials ([platform](15-platform-data-architecture.md) PLAT-005).

### BIZ-017 · Non-clinical facilitator training
Priority P3 · Phase S4 · Status new · Pillars: CARE, TOGETHER
Why: activity staff and family facilitators ask for guidance. A course could earn revenue and reach more people. The risk is that it looks like art therapy training.
What: a short, non-clinical course on running creative activities with adaptations. No claims of therapy, treatment or clinical outcomes. Any clinical content is delivered or reviewed by credentialed professionals, and the course never uses the term "art therapy" to describe itself.
Acceptance:
- Course outline reviewed by a credentialed reviewer where clinical topics appear.
- Wording checks pass ([R3 §7], wording rules).
- No certificate that implies professional standing.
Evidence needed before trying: demand from activity directors (BIZ-009 interviews); a credentialed partner for any clinical element; a pilot cohort with feedback.
Risks / not doing: any course that teaches therapy techniques. Not in scope.

### Children

### BIZ-018 · No paid child content and no in-app purchases for children
Priority P0 · Phase S2 · Status new · Pillars: GROW
Why: [R2 §5] shows that the trusted kids' apps (Khan Academy Kids, PBS KIDS, CBeebies Learn) have no ads and no purchases. [R5 §5.1] names COPPA and the UK Age Appropriate Design Code, which set high-privacy defaults and ban nudges to share data.
What: all child-directed content is free, with no purchases inside it. No child accounts. Paid products for families (BIZ-007) are sold to adults, and their pages make no child-directed claim.
Acceptance:
- Child-directed pages contain no purchase prompts.
- Checkout pages are not reachable from child-directed pages without an adult step.
- Compliance review by counsel before any child-directed paid product is sold.
Depends on: [trust, safety, accessibility and privacy](14-trust-safety-accessibility-privacy.md).
Risks / not doing: paid kids' subscription boxes. Not in scope; [R2 §2] shows the price opacity this category often has.

---

## 3. Items at a glance

| ID | Item | P | Phase | Status | Evidence before trying |
|---|---|---|---|---|---|
| BIZ-001 | Free core | P0 | S1 | exists | none (a commitment) |
| BIZ-002 | No ads | P0 | S1 | exists | none (a commitment) |
| BIZ-003 | No sale of data | P0 | S1 | exists | none (a commitment) |
| BIZ-004 | No paid placement or endorsements | P0 | S1 | new | none (a commitment) |
| BIZ-005 | Cost ledger | P0 | S1 | new | none, start now |
| BIZ-006 | Supporter membership | P1 | S2 | new | 10 households and 10 organizations interviewed |
| BIZ-007 | Printed packs | P1 | S2 | new | 20 samples, reorders, break-even print cost |
| BIZ-008 | Printed book | P2 | S3 | new | BIZ-007 sell-through; 40 reviewed activities |
| BIZ-009 | Institutional planning license | P2 | S3 | new | 10 interviews, 3 paid pilots |
| BIZ-010 | Library program license | P2 | S3 | new | letter of intent; print run plan |
| BIZ-011 | Grants under policy | P1 | S2 | new | costed review plan; 10 funders assessed |
| BIZ-012 | Research funding | P1 | S2 | new | named partner; ethics route; protocol |
| BIZ-013 | Sponsorship rules | P2 | S3 | new | audience size; policy-fit sponsor |
| BIZ-014 | Affiliate links (if any) | P3 | S3 | new | six-month test with complaint tracking |
| BIZ-015 | App premium for new features | P2 | S4 | new | day-90 gates; 10 organizations and 20 families asked |
| BIZ-016 | Paid review as cost line | P1 | S2 | new | measured cost per reviewed page |
| BIZ-017 | Non-clinical facilitator training | P3 | S4 | new | demand; credentialed partner; pilot cohort |
| BIZ-018 | No paid child content | P0 | S1 | new | counsel review before any child product |

Counts: 18 items. P0 6 (001, 002, 003, 004, 005, 018). P1 5 (006, 007, 011, 012, 016). P2 5 (008, 009, 010, 013, 015). P3 2 (014, 017).

## Open questions

1. **Subscription conflict.** Should the strategy document's "Family Plus" subscription be formally rejected, or kept as a later option? This file treats it as not adopted, in line with the plan's verdict.
2. **Payments boundary.** Who decides when the payments boundary in `product.md` lifts for donations, print sales or app purchases?
3. **Grant cap.** Is 30% a reasonable cap on any single funder's share (BIZ-011), or should it be lower?
4. **Fulfillment.** Print-on-demand or a print partner for BIZ-007? Each has different unit economics and return rules.
5. **Institutional features.** Which planning features would organizations pay for, and are any of them already free in the app?
6. **Counsel.** Consumer, tax and charity-status questions for donations and grants need professional advice before launch.
