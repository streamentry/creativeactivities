# 05. Search scale, demand, distribution, and trust at global scale

**Scope and date:** 2026-11-14. Covers (1) scale playbooks of seven large information and how-to sites, (2) search-demand clusters for our space, (3) distribution beyond search, (4) trust, safety, and legal obligations, and (5) a ranked list of 15 content clusters.

**Evidence rules used here:** Every figure has a source number in Section 8 and an as-of date. Third-party trackers are marked as such. Where I could not measure something, the text says "estimate" and gives the method. Google Trends, Ahrefs, and Semrush were not queried directly for our terms; the one attempt to read a public trends page (Glimpse) returned no dementia or senior-craft data. Competition ratings in Section 6 are **judgement from the category's known incumbents, not a live SERP audit**. The first step in Section 7 is to replace them with one.

---

## 1. The headline lesson

The largest information sites did not win on one clever tactic. They combined four things: a repeatable content model (one page type, many instances), a visible trust layer (named reviewers, dates, sources), a translation pipeline that separates volunteer, AI, and professional work, and distribution that does not depend only on search. Our constraint is different: we cannot publish thousands of thin pages, and we should not try. We can copy the trust layer and the content model at small scale, and be deliberately narrower on everything else.

---

## 2. Scale playbooks

### 2.1 Landscape

| Site | Audience and scale (source) | Content model | Trust signals | Translation approach | What makes it win | Relevance to us |
|---|---|---|---|---|---|---|
| **Wikipedia** | About 364 language editions and about 68.3M articles in a September 2026 Meta-Wiki snapshot; English alone is about 7.2M articles per a third-party July 2026 summary [1][2] | Community-written encyclopedia entries; one article per topic per language | Citations required, talk pages, community review, transparent edit history | Each language edition is written independently; no single machine-translated mirror. Many large non-English editions are bot-heavy, so counts overstate depth [1] | Founding-era coverage, neutrality policy, and the fact that it is the default citation target for search and AI answers | Model for citation discipline and per-language independence, not for volume |
| **wikiHow** | Third-party estimates of about 40M monthly visitors, about 82% organic (Techlist); Semrush shows a decline in early 2026 [3][4]. Treat as estimate | Step-by-step how-to articles with images, one task per URL | "Expert" checkmark where a professional verified a version; the badge covers only some articles [5] | Multiple language subdomains; I found no public detail on its method | Task-shaped page that matches "how do I" intent exactly | Closest content model to ours. Copy the step format and the explicit "not every article is expert-checked" honesty |
| **Khan Academy** | Official 2024–25 annual report: 189.6M registered users, 104.9M yearly active learners, 66.8B learning minutes, 2.0M Khanmigo users [6] | Lessons, exercises, videos with a consistent structure | Nonprofit status, subject-expert authorship, published content standards | Volunteer translators coordinated on Crowdin; a case study cites 1.3M words translated [7] | Free, consistent format, and a volunteer community that does the localization | Volunteer translation with a review step is a plausible model for us at small scale |
| **Duolingo** | Large user base, but I did not find a current public MAU figure in this pass | Structured courses from a base template | Product-led; learning outcome claims are generally avoided | AI-first course translation: reporting says courses are generated from a base course and expanded to all 28 user-interface languages [8]. A Bloomberg summary reports 148 courses generated; verify against the primary report. A 10% cut in contracted translators in January 2024 was reported as a move toward AI translation [8] | Engineering-led template reuse, gamified progress | Template reuse is relevant. Gamification is not (see Section 5) |
| **Pinterest** | 661M global monthly active users in Q3 2026, up 10% YoY; US and Canada 107M; Gen Z 57% of users [9] | Pins linking to an external page; boards as curation | Search-first and visual; less about editorial trust | Heavy machine-translated search surface across locales (general knowledge; not verified in this pass) | Pins as a discovery layer with long shelf life | Our largest distribution channel for visual craft ideas (Section 4) |
| **Quizlet** | Over 60M monthly active users as of 2021 per Wikipedia; I found no 2025–26 official user figure [10] | User-generated study sets | Weak; quality varies by creator | User-generated, so translation depends on the creator | Massive user-generated library and study-mode habit | Not a model. Shows the risk of user-generated quality |
| **Healthline** | Traffic figures not found in this pass | Medical articles reviewed by a medical network; product reviews | Named medical reviewers with review dates; periodic audits; stated separation of editorial and commercial teams for product and shopping content [11] | Not verified | Health-intent pages with strong E-E-A-T signals | Best trust-layer model for health-adjacent content such as dementia care, with a clear "not medical advice" boundary |

### 2.2 What the playbooks teach

1. **One page type, one job.** wikiHow's step pages and Khan's lesson pages both answer one question each. Our equivalent is one activity page answering "what can we do with this person, with these materials, in this setting".
2. **Visible review dates beat claims of expertise.** Healthline shows a medical-review date per piece and re-audits content [11]. We should show "adapted for seated use, reviewed by [role], last checked [date]". Do not show a reviewer's credential we do not hold.
3. **Honest partial coverage.** wikiHow says not every article is expert-checked [5]. This is a better trust signal than an unqualified "expert" label on everything.
4. **Volunteer translation needs a review loop.** Khan's Crowdin workflow [7] is a model for community translation with reviewers. Machine translation with native-speaker review is the only version we can afford at scale.
5. **Template reuse beats hand-written pages.** Duolingo's approach [8] shows that one structured template can scale across languages. The lesson for us is structure, not gamification.

### 2.3 Translation: machine versus human

Recommendation for us:

- **Start with human-written English plus one reviewed language**, chosen from where caregivers and families actually search (Section 3 will need a US and one contrasting-market check).
- **Machine translation as a draft only**, with a native-speaker review step before publish, and a visible "translated, reviewed on [date]" line. Do not publish unreviewed machine text on health-adjacent or care-adjacent pages; a mistranslated instruction about materials or safety is a real harm.
- **Translate the structure, not just the words.** Adaptation notes (seated version, low-dexterity version) must survive translation. Failure here is the most likely quality defect.
- **Hreflang and locale URLs** only when a locale has reviewed content. Thin machine-translated mirrors are the penalized pattern in Section 2.4.

### 2.4 Programmatic SEO: done well versus penalized

- **Penalized:** pages generated at scale with little unique value, including mass-produced AI pages and third-party content hosted on a strong domain with little oversight. Google's scaled content abuse policy names this as a spam category since March 2024 [12]. Its site reputation abuse policy, clarified in November 2024, targets third-party content used to exploit a host's ranking, and says first-party involvement does not exempt a site [13].
- **Changing:** Google's site reputation abuse manual actions in the EEA are reported to stop affecting search results from 30 August 2026, replaced by a system that can rank affected sections independently [14]. This is a single summary; verify against Google's documentation before relying on it.
- **Helpful content:** The helpful content system became part of Google's core ranking systems in the March 2024 core update [15]. There is no longer a separate "helpful content update" to plan around; the signal sits inside core updates.
- **Generative AI:** Google's guidance is that AI use is not penalized in itself; scaled, low-value pages are [16]. A single report says the accuracy section was revised on 1 October 2026 to call for human checking [16]; verify on Google's page.
- **Done well (for us):** a small number of pages, each with a real adaptation, a materials list, a time estimate, and a named reviewer role. Programmatic generation is acceptable only for structured fields (materials, time, setting), not for the activity idea itself.

### 2.5 E-E-A-T and AI answer engines (GEO)

- **E-E-A-T is an evaluation framework, not a ranking switch.** Google's quality rater guidelines and its guidance on people-first content both ask for first-hand experience and clear authorship [16]. For us, first-hand experience means: we have actually run the activity with a person, or a named practitioner did.
- **AI Overviews reach is disputed.** Estimates range from roughly 16–21% of queries (Semrush and Ahrefs tracking) to 43% (a Similarweb figure reported secondhand). Healthcare and education queries show high prevalence (87% in a May 2025 BrightEdge dataset) [17]. Treat these as estimates.
- **Click impact is significant.** Seer Interactive found organic CTR on AI Overview queries fell from 1.76% to 0.61%. Chartbeat reports search referrals down 60% for small publishers (1,000–10,000 daily page views) and 22% for large ones [17]. Small publishers are the most exposed; our site is small.
- **Citations matter more than rank.** Reddit, Wikipedia, and YouTube are among the most-cited sources inside AI answers [17]. This is the strongest argument for building citable, self-contained activity pages and for being present on YouTube (Section 4).
- **Branded queries hold up.** One source reports a rise in CTR for branded queries when AI Overviews appear [17]. Our brand name should be visible on every page.

---

## 3. Search-demand clusters

### 3.1 What the evidence can and cannot show

- **Our keyword export is the wrong market.** `docs/strategy/keywords-2026-11-13.md` notes that all 1,211 rows are priced in VND, so the targeting is Vietnam and the volumes are not a US demand map. Volumes are rounded buckets (50, 500, 5,000, 50,000, 500,000) and competition is a Google Ads metric, not organic difficulty [repo file].
- **The export has none of our Tier A and B clusters as direct entries.** `dementia activities`, `activities for seniors`, `reminiscence`, `seated`, `printable`, `sensory`, and `grandparent` do not appear. The nearest rows are `therapeutic art activities` (5,000), `for seniors` (5,000), and `dementia patients` (5,000), all Vietnam-targeted [repo file].
- **The App Store scorecard is a better signal for dementia-activity intent than the Google export.** In the iTunes search (US), "dementia activities" ranks an app that leads on the term, with brain-training apps around it; "reminiscence dementia" ranks a reminiscence app first; "alzheimers games" is not in the top 50 [repo file, `keyword-research.csv`, 2026-10-31]. These are approximations of App Store search, not a volume measure.
- **Glimpse-style trend data shows adjacent senior leisure is growing.** A Glimpse page updated October 2026 lists pickleball at +42% YoY with an 8.4M volume label, noted as most popular among the 60+ group [18]. Volume labels are not defined as monthly or annual. This indicates senior leisure interest, not craft demand.
- **Pinterest's parenting trend data shows demand for offline, screen-free activities** ("screen free activities", "family traditions ideas") from a February 2026 report [19]. It does not cover seniors.
- **Google Trends was not retrieved.** The search tool returned only articles, not trend series, for "crafts for seniors" and "activities for seniors". I have no reliable 2025–26 relative-interest data for any of our terms. Section 7 lists the measurement needed.

### 3.2 Estimated demand levels (estimate, not measured)

Labels: **H** high, **M** medium, **L** low, **?** unknown. These combine the repo export's presence and scale, the App Store scorecard, and general category knowledge. They are not search-volume measurements.

| Cluster | Estimated demand | Evidence basis |
|---|---|---|
| Crafts for kids; rainy-day activities; holiday crafts; easy crafts; crafts for adults | H (broad) | Category size on Pinterest and general publishers; not measured for our geography |
| Activities for seniors (head term) | H, mixed intent | Export shows `for seniors` at 5,000 (Vietnam); intent includes care-service searches the site does not serve [repo file] |
| Dementia activities | M–H | App Store #1 on the term; export shows `dementia patients` at 5,000 (Vietnam); care-service and medical intent mixed in |
| Reminiscence activities | M | App Store reminiscence apps rank well; repo lists it as "not yet measured" |
| Grandparent activities | ? (likely M) | Repo lists it as "not yet measured" |
| Sensory activities (children) | M, gated | Tier C in SEO.md; not measured |
| Art therapy and therapeutic art | M in Vietnam export (5,000 for `therapeutic art activities`); scoped use only | Repo file; see Section 5 on claims |

---

## 4. Distribution beyond search

| Channel | What to do | Why it works | Risk or limit |
|---|---|---|---|
| **Pinterest** | One pin per activity, with a vertical image and a title that matches the search phrase (for example "Seated Painting Activities for Seniors"). Board per situation (dementia at home, grandparent visits, rainy day). Pin the printable version separately. | Pinterest reached 661M users in Q3 2026 [9]; visual, planning-oriented search. Vendor guides say fresh pins outperform repins, but that is one vendor's claim [20] | Pinterest search is not Google search; Google keyword data may not match Pinterest demand. Generic "crafts" pins are very crowded |
| **YouTube Shorts** | Short demo of one activity being done, with adaptations shown on screen. Captions on by default. Long-form only for dementia-care demonstrations with a reviewer. | YouTube states Shorts average over 200B daily views (June 2025 statement) [21]. YouTube is among the most-cited sources in AI answers [17] | Made-for-kids labelling rules apply to any child-facing content (Section 5). Faces of people with dementia require consent |
| **Printable sharing** | Free printable card with materials, steps, and one adaptation; print-friendly layout; QR to the full page. Share through care-home and library newsletters. | Printables are shareable offline and do not require an account; they fit the mission's no-screen promise | Printed copies cannot be updated; date and version every print |
| **Schools and libraries** | Partner with public libraries (free programming calendars) and intergenerational programs; offer a one-page guide and a facilitator note. | Libraries have trusted local reach and are a legitimate source for older adults | Requires a named contact and written permission to use their logo. No claims of endorsement without it |
| **Care homes and activity directors** | Provide a free "activity of the week" sheet for activity staff; ask for feedback on what worked. | Activity directors plan repeatedly and need adaptable ideas; they are a natural feedback loop | Care homes are a regulated setting; do not present our activities as care plans |
| **Email** | Opt-in newsletter organized by situation (not by age or diagnosis); one activity per email; unsubscribe in one click. | Email is the only channel we own; it works without ad tech | Do not use streaks or urgency. Do not collect birth dates for targeting |
| **Community and word of mouth** | Share through caregiver groups, intergenerational programs, and family networks; ask recipients to share a photo of the result (with consent). | Shared-moment stories are our mission metric | Keep reviews and testimonials genuine; no incentives for ratings |

---

## 5. Trust, safety, and legal at global scale

These are the obligations that apply to a free, public website with optional accounts, possible user uploads, and content for families, children, and older adults. This is a product-level summary, not legal advice. Take each item to counsel before launch.

### 5.1 Children's privacy

- **US COPPA.** The amended COPPA Rule was published 22 April 2025, took effect 23 June 2025, and full compliance was required by 22 April 2026 [22]. It includes a separate verifiable parental consent step before disclosing children's personal information to third parties for targeted advertising [22]. An FTC policy statement dated 25 February 2026 limits enforcement where children's data is collected solely for age verification without prior parental consent; treat this as a narrow relief, not a safe harbour [23]. Design implication: no third-party ads or ad-tech on any page a child can reach; no accounts for under-13s; no collection of persistent identifiers from children.
- **UK Age Appropriate Design Code (the Children's Code).** Fifteen standards, statutory under the Data Protection Act 2018, applies to online services likely to be accessed by under-18s [24]. Relevant standards include best interests of the child, default high privacy, data minimization, detrimental use of data, and nudge techniques (from the code's known list; verify the full list against ICO's page). Design implication: children's privacy settings on by default; no nudges to share more data.
- **YouTube's made-for-kids labelling.** Creators must label videos as made for kids or not, and YouTube applies machine learning to flag content that should be labelled as child-directed [25]. Any kids-focused video we publish needs an accurate label. Note that the labelling rule came from a 2019 FTC settlement (about $170M) [25].

### 5.2 Health and special-category data (GDPR)

- Information about a person's health is special-category data under GDPR Article 9(1). A dementia diagnosis or care need recorded about someone is health data. Our "dementia activities" content does not need to collect health data, and we should avoid collecting it. Any feature that asks "what is the person's diagnosis?" creates Article 9 obligations and should not exist in the core product. (From the GDPR text; verify with counsel.)
- Age alone is not special-category data, but combined with other data it can become sensitive. Keep the minimum: a situation tag, not a birth date or a condition.
- The site must not imply that an activity treats or manages a condition. That is both a product rule (MISSION.md; SEO.md) and an advertising-standards risk.

### 5.3 Art therapy as a protected term

- "Art therapy" is a credentialed clinical profession. In the US, practitioners are credentialed (for example, ATR and ATR-BC designations) and similar regimes exist elsewhere (from general knowledge; verify per market). The repo's cluster mapping [repo file, `keywords-2026-11-13.md`] already handles this: explain the profession, point to credentialed therapists, and say plainly that our activities are not therapy.
- The search demand for "therapeutic art activities" (5,000 in the Vietnam export) is real and should be served with scoped wording ("relaxing art activities for adults"), with no claims of healing, symptom reduction, or treatment.
- Any page mentioning Parkinson's, stroke recovery, or rehabilitation (SEO.md Tier D) needs a reviewer with a relevant clinical background and a clear non-clinical scope, or should not be published.

### 5.4 Accessibility law

- **WCAG 2.2.** W3C Recommendation since 5 October 2023; approved as ISO/IEC 40500:2025 on 21 October 2025 [26]. It adds nine success criteria and removes 4.1.1 Parsing [26]. Sources differ on the level split of the nine (two A, four AA, three AAA is the most common reading); check the W3C "What's New in WCAG 2.2" page [26]. Our target should be WCAG 2.2 AA, with the Atkinson-based design system already tested against it.
- **European Accessibility Act (Directive 2019/882).** Applies from 28 June 2025 to online shopping, e-books and reading software, consumer banking, and passenger services, including the websites and apps that support them [27][28]. Our free site is probably out of scope for the core service, but any paid app, purchase, or e-book-like printable bundle sold to EU consumers may be in scope. A microenterprise exemption exists (fewer than 10 employees and under €2M turnover per one source); verify against the Directive text. Transition periods for existing content are reported differently across sources (2030 for some content); verify before relying on them [27][28].
- **Older users and motor function.** Target sizes, focus states, and error messages matter more here than for general audiences. Test with people who have arthritis and low vision, not only with automated checks.

### 5.5 User-generated content and moderation

- Uploading photos of activities, especially of older adults and children, creates image-rights and consent issues. Require consent from the person pictured (or their legal representative for someone with dementia who cannot consent), and never publish a face of a child without an explicit parental release.
- Moderate reported content quickly. Publish a clear reporting path and response standard. The EU Digital Services Act requires notice-and-action mechanisms for hosting services and additional protections for minors; check whether our hosting role triggers those duties (general knowledge; verify with counsel). The UK Online Safety Act may apply to user-to-user features, with Ofcom children's codes (general knowledge; verify).
- Do not rely on user ratings as a trust signal without moderation. Review manipulation is a known issue on large platforms.
- Image rights for stock or licensed material: keep a rights log with source and license per image.

### 5.6 Trust and transparency checklist for every page

- Named author role, reviewer role, and dates ("last checked").
- What is adapted and for whom, and what is not suitable.
- Materials, time, and safety notes (for example, small parts, sharp tools, choking hazards for children).
- Clear statement that the activity is not therapy or care advice.
- No ads on child-directed pages; no third-party trackers on child-directed pages.

---

## 6. Ranked content clusters

Ranking uses demand (Section 3, estimated) against competition (judgement from incumbents, not measured) and our ability to be specific. Confidence is low to medium for every rank. Example queries are candidates to check with a US-targeted Keyword Planner export and Search Console after launch.

**Intent key:** **Find** = looking for an idea. **Do** = ready to start, wants steps and materials. **Adapt** = needs a version that fits a person's ability. **Share** = wants something to do together, often printed.

| Rank | Cluster | Example queries | Demand (est.) | Competition (judgement) | Intent | Opening |
|---|---|---|---|---|---|---|
| 1 | Seated and bedside activities for seniors | seated activities for seniors; bedside activities for elderly; activities for bedridden elderly | M | Lower: few dedicated, well-structured pages | Adapt, Do | Strongest fit with the mission; each page is a one-glance card |
| 2 | Easy crafts for seniors with arthritis or limited dexterity | easy crafts for seniors with arthritis; crafts for seniors with limited hand strength | M | Lower-medium | Adapt | Adaptations are the differentiator; few sites explain grip and tool changes |
| 3 | Reminiscence activities (non-clinical) | reminiscence activities; reminiscence activities for dementia; photo memory prompts | M | Medium: App Store leaders and care-blog pages | Find, Do | Use a neutral, non-clinical frame; avoid brain-training wording (repo flags it) |
| 4 | Printable activities for older adults | printable activities for seniors; printable activities for dementia | M | Medium-high: Pinterest-heavy | Share | Printable with adaptation notes and a single-page layout |
| 5 | Grandparent and grandchild activities (intergenerational) | grandparent and grandchild activities; activities for grandparents and grandkids | M (?) | Medium-high on Pinterest | Find, Share | Shared-moment framing and adaptation for the older person |
| 6 | Christmas and holiday crafts for seniors | christmas crafts for seniors; easy fall crafts for elderly; holiday crafts for adults with limited mobility | M, seasonal | Medium: care sites and craft blogs | Find, Do | Seasonal calendar; seated and low-dexterity versions |
| 7 | Dementia activities at home | dementia activities at home; activities for dementia patients; dementia activities that are fun | M–H | High: medical and charity sites, plus App Store leaders | Find, Adapt | High demand but high trust bar; must be reviewed and non-clinical |
| 8 | Easy art activities for seniors | easy art activities for seniors; arts and crafts for seniors; painting for seniors | M | Medium | Find, Do | Materials kits and low-mess versions |
| 9 | Relaxing art activities for adults | relaxing art activities for adults; painting for relaxation; drawing for adults (scoped, no therapy wording) | M in Vietnam export (`therapeutic art activities` 5,000) | Medium-high | Find | Use "relaxing" wording and the non-therapy statement; this already has a page |
| 10 | Music activities for seniors | music activities for seniors; singing activities for elderly | M | Medium: established music-and-memory programs | Find, Do | Creative, non-listening versions (for example, making a playlist together) |
| 11 | Storytelling and life-story activities for older parents | storytelling activities for elderly parents; life story activities for seniors | L–M | Low | Find, Share | Low volume but strong fit with the mission and low competition |
| 12 | Low-mess sensory activities for children | low mess sensory activities; sensory activities for autistic children | M, gated | Medium: occupational-therapy blogs | Find, Do | Gated by Tier C; needs COPPA-safe design and no child accounts |
| 13 | Quiet and rainy-day activities at home | rainy day activities for kids; indoor activities for families | H (broad) | Very high | Find | Low opening alone; use only as a hub that links to specific clusters |
| 14 | Easy crafts for adults | easy crafts for adults; crafts for adults to do at home | H (broad) | Very high | Find | Only win with adaptation or a specific situation |
| 15 | Crafts for kids at home | easy crafts for kids; crafts for kids at home | H (broad) | Very high: Pinterest, retailers, publishers | Find | Lowest opening; wait for evidence, and gate behind the children's privacy work |

**Not ranked, and why:**
- `activities for seniors` and `dementia` as head terms. Mixed intent, including care-service searches the site does not serve (repo file). Use as hub pages only.
- Anything about stroke recovery, Parkinson's, or rehabilitation (SEO.md Tier D). Requires clinical review and a scope decision first.

---

## 7. Next measurements (in order)

1. **Replace the Vietnam export with US and one contrasting-market exports** for the 15 example query sets above, with targeting recorded next to the file (as the repo file already asks).
2. **Run a SERP audit** for the top 10 queries in each of the 15 clusters: note which sites rank, whether they are Pinterest, marketplaces, medical sites, or small publishers, and whether AI Overviews appear. This replaces the judgement ranking in Section 6.
3. **Pull Google Trends** (US, 2021–2026, plus relative comparisons between clusters) and record the exports. This was not possible here.
4. **Pinterest Trends** for the same terms, because Pinterest demand can differ from Google demand.
5. **After launch:** Search Console queries for the top pages, with impressions for nonbranded queries as the primary demand signal.

---

## 8. Sources (accessed 2026-11-14)

1. Wikimedia Meta-Wiki, Wikipedia index and language-edition statistics (September 2026 and June 2026 snapshots as summarised in search results): https://meta.wikimedia.org/wiki/Wikipedia
2. Third-party Wikipedia statistics summary (March and July 2026 figures): https://voxbooster.com/blog/wikipedia-statistics-2026
3. Techlist.ai, wikihow.com traffic estimate: https://techlist.ai/wikihow.com
4. Semrush, wikihow.com traffic overview (snapshot dated January 2026): https://tr.semrush.com/website/wikihow.com/overview
5. Common Sense Media, wikiHow review (expert checkmark description): https://www.commonsensemedia.org/website-reviews/wikihow
6. Khan Academy Annual Report 2024–25: https://www.annualreport.khanacademy.org/
7. Crowdin case study, Khan Academy translation: https://www.casestudies.com/company/crowdin/case-study/khan-academy-increased-international-awareness-and-involved-thousands-of-product-users-worldwide-into-translation-effort-using-crowdin
8. The Batch (DeepLearning.AI), Duolingo AI translation to 28 user languages: https://www.deeplearning.ai/the-batch/duolingo-turns-to-ai-translation-to-expand-its-most-popular-courses-to-all-28-user-languages
9. ContentGrip, Pinterest Q3 2026 user figures; Nasdaq, Pinterest Q3 2026 earnings call: https://www.contentgrip.com/pinterest-user-growth-ad-gap/ and https://www.nasdaq.com/articles/pinterest-pins-q3-2026-earnings-call-transcript
10. Wikipedia, Quizlet (2021 user figure): https://en.wikipedia.org/wiki/Quizlet
11. Healthline, editorial process: https://www.healthline.com/about/process
12. Google Search Central, site reputation abuse policy (November 2024 update): https://developers.google.com/search/blog/2024/11/site-reputation-abuse
13. Google site reputation abuse clarifications (secondary coverage): https://www.seroundtable.com/google-clarifies-site-reputation-abuse-policy-manual-actions-38781.html
14. Search Engine Journal, site reputation abuse and EEA change: https://www.searchenginejournal.com/google-updates-site-reputation-abuse-policy-removes-penalties-in-eea/587429/
15. Search Engine Roundtable, March 2024 core update and helpful content system: https://www.seroundtable.com/google-march-2024-core-update-37003.html
16. Google Search Central, guidance on generative AI content: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
17. Search Engine Journal, AI Overviews and publishers; DesignRush, AI Overviews publisher traffic 2026: https://www.searchenginejournal.com/google-ai-overviews-impact-on-publishers-how-to-adapt-into-2026/556843/ and https://news.designrush.com/ai-overviews-publisher-traffic-website-strategy-2026
18. Glimpse, activity and hobby trends (last updated October 2026): https://meetglimpse.com/activity-hobby-trends
19. CNN Health via Kion Central Coast, Pinterest parenting trend report (February 2026): https://kioncentralcoast.com/health/cnn-health/2026/02/24/pinterest-search-trends-reveal-parents-push-for-offline-and-experience-rich-parenting/
20. Tailwind, Pinterest SEO in 2026 (vendor guide): https://www.tailwindapp.com/blog/?p=13986
21. Loopex Digital, YouTube Shorts statistics (secondary; cites the June 2025 official figure): https://loopexdigital.com/blog/youtube-shorts-statistics
22. Hunton, COPPA amended rule compliance deadline (alert dated 23 April 2026): https://www.hunton.com/privacy-and-cybersecurity-law-blog/coppa-rule-amendment-compliance-deadline-approaches
23. Hunton, FTC COPPA amendments; FTC policy statement of 25 February 2026 as summarised in search results: https://www.hunton.com/privacy-and-information-security-law/ftc-publishes-final-coppa-rule-amendments
24. ICO, Age Appropriate Design Code executive summary: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/executive-summary/
25. SuperAwesome, YouTube made-for-kids policy (secondary): https://www.superawesome.com/blog/everything-brands-and-creators-need-to-know-about-youtubes-new-policy-on-kids
26. W3C, What's New in WCAG 2.2: https://w3.org/WAI/standards-guidelines/wcag/new-in-22/ ; secondary on ISO/IEC 40500:2025: https://testparty.ai/blog/wcag-2-2-is-now-iso-iec-40500-2025
27. Siteimprove, European Accessibility Act FAQ: https://siteimprove.com/en/blog/the-european-accessibility-act-frequently-asked-questions/
28. Reed Smith, EU Accessibility Act now in force: https://www.reedsmith.com/our-insights/blogs/viewpoints/102kxnd/the-eu-accessibility-act-is-now-in-force/
29. Repo files: `/Volumes/SANDISK-Data/creativeactivities-2026/docs/strategy/keywords-2026-11-13.md`, `/Volumes/SANDISK-Data/creativeactivities-2026/docs/strategy/keyword-research.csv`, `/Volumes/SANDISK-Data/creativeactivities-2026/SEO.md` (sections 2, 3.2, 3.3), `MISSION.md`, `VISION.md`, `DESIGN.md`.

Items marked "general knowledge" or "verify" (GDPR Article 9, EU Digital Services Act duties, UK Online Safety Act, art-therapy credential names, Duolingo's 28-language claim, Pinterest translation practice) were not checked against a primary source in this pass.
