# 01 · Craft, DIY and creative-making platforms

## 1. Scope and date

- **Date of research:** 2026-11-14. All access dates below are 2026-11-14 unless stated.
- **Domain:** the largest craft, DIY, and make-it-yourself platforms, and what made them dominant. Covered: Pinterest, YouTube craft and art channels, Instructables, wikiHow, The Spruce Crafts, Etsy, Cricut Design Space, Domestika, Skillshare, Craftsy/Bluprint, Michaels and Hobbycraft project libraries, Ravelry, and Canva.
- **Read first:** MISSION.md, VISION.md, DESIGN.md. Skimmed category-leader.md and competitors.md (both dementia-app focused; this file does not repeat them).
- **Verification status:** Several platforms could not be fetched directly (wikiHow's About page blocked; Instructables' About page returned only a loading placeholder). Figures come mostly from search snippets and third-party trackers, and are labelled by reliability. Feature descriptions marked "general knowledge" were **not re-checked this session** and should be verified before the spec quotes them.

## 2. Landscape table

Scale figures are the best available; reliability is noted in brackets.

| Platform | Audience | Scale (source, as of) | Core features | Business model | What makes it win |
|---|---|---|---|---|---|
| **Pinterest** | Everyone planning a project; crafters, parents, teachers | 661M global MAU, Q3 2026, +10% YoY (company results via [1][2]) | Boards, pins, visual search, saves, shopping | Advertising and shopping | Intent capture: people arrive with a half-formed idea and leave with a saved plan. Pins sit in search for months. |
| **YouTube craft/art channels** (e.g. Art for Kids Hub) | Children, parents, hobbyists | Art for Kids Hub ~10.4M subs (third-party tracker, undated snapshot [14]) | Step-by-step video, timestamps, supply lists in description | Ads, sponsorship | Watch-along format with low setup; the viewer copies in real time. |
| **Bob Ross legacy channel** | Adults, retirees, beginners | 6.2M subs (third-party, 2025-06-15 [15]); all 403 episodes free [16] | Full back-catalog of half-hour episodes; annual marathon | Official channel, licensing | Calm, unhurried tone; a whole catalog is free and always on. |
| **Instructables** (Autodesk) | Makers, engineers, teachers | ~85,000 projects per a 2012 Autodesk statement [13] (**stale**; no current figure found) | Step-by-step projects with photos; contests; themed collections | Autodesk-owned; ads and sponsorship | Maker-authored, detailed build logs; strong on electronics and fabrication. |
| **wikiHow** | Anyone, any how-to | 19 languages [4]; 35.5M monthly visitors in early 2025, down from a 100M peak in 2016 (secondary source [5]) | Numbered steps with photos; "Things You'll Need"; summary; quality tiers | Ads | Structured, skimmable templates and very broad topic coverage; SEO-led. Traffic is declining (see §6). |
| **The Spruce Crafts** (Dotdash Meredith) | Home crafters, DIY | No verified figure found | Editorial projects, tutorials, supply lists | Advertising, affiliate | Editorial voice and reliable instructions. Crafts reviewer process not verified. |
| **Etsy** | Buyers of supplies, finished goods, printable patterns | Seller count reported as 7.5M to 8.1M across third-party guides [22] (**low reliability**) | Listing search, digital downloads, shop pages | Transaction and listing fees | Marketplace for craft patterns and printables; one of the oldest digital-download categories. |
| **Cricut Design Space** | Cricut machine owners, crafters | Library size advertised from ~100k to 1.5M images; sources conflict [11] | Free projects; design tools; Cricut Access subscription | Hardware, consumables, subscription | Ready-made projects tied to a machine. Lock-in: subscription content lost when plan ends [12]. |
| **Domestika** | Creative adults learning new skills | ~1,850 Spanish, 883 English, 249 Portuguese courses (2024 Class Central breakdown [17]); about 76% art and design | Video courses with projects; community | Course sales | Teacher-led, high-production courses; strong in Spanish-speaking markets. |
| **Skillshare** | Creative professionals, hobbyists | ~$78M revenue in 2024 (third-party [18]); 500k+ paid subs as of May 2023 (**dated**) | Subscription library of short classes | Subscription | Low-cost all-you-can-watch model; class projects shared in-platform. |
| **Craftsy / Bluprint** | Sewing, quilting, knitting, cake | Sold 2020; Bluprint assets sold to TN Marketing [21] | Paid video classes | Subscription, then per-class | Strong teacher-led classes; a cautionary tale for buyers when service ends. |
| **Michaels (MakerPlace) and Hobbycraft** | Shoppers who also craft | "Hundreds" of free projects; video; free downloadable templates (Michaels' own description [19]) | Project hub, how-to pages, paid classes | Retail; project pages drive purchases | Retailer-owned: the project is a reason to visit the shop. |
| **Ravelry** | Knitters, crocheters, weavers | ~1.2M patterns in the database; 87,106 added in 2022 (official [6]) | Pattern database, project pages, notes, stash, ratings, forums | Pattern-store fees, ads, affiliate, donations; free membership with an optional $5/year upload fee [8] | Community-built database; every project logs "I made this". Pattern-seller tiers are sliding and independent of member fees. |
| **Canva** | Everyone designing | ~265M MAU (estimate [9], 2026) | Templates for everything; editor | Freemium, Pro, Teams | Templates as onboarding: a finished-looking result in one tap. Template count unresolved (see §4). |

Reliability note: Pinterest and Canva MAU are company-linked or company-cited; the rest are third-party trackers, guides, or dated primary statements.

## 3. Feature patterns worth adopting

1. **The project page answers "can I start this?" in the first screen.** wikiHow and Instructables both put the summary, materials and time up top; wikiHow's "Things You'll Need" list is the key device (general knowledge; verify). *Source pattern for DESIGN.md §4B.*

2. **Structured metadata drives filters.** Ravelry's pattern database is searchable by yarn weight, needle size, and difficulty; Cricut and Michaels filter by project type and skill (general knowledge; verify against live sites). Our editorial schema in DESIGN.md §5 already goes further (energy, sensory, supervision). Copy the principle, not the facets.

3. **"I made this" as the community unit.** Ravelry's project pages attach a finished item to a pattern, with photos, notes and modifications. This is the most reusable UGC pattern in the set: it creates proof, variations, and reasons to return, without ratings wars. Adapt as "I did this" with optional notes on adaptations. Do not make it a leaderboard.

4. **Pins as shareable physical or visual artifacts.** Pinterest's core unit is a saved image that carries a link back to the plan. Our Activity Card (DESIGN.md §8) is the equivalent: a printable, shareable object. Copy the save-and-share behavior; reject ad-funded feed mechanics.

5. **Free ready-made projects inside a tool.** Cricut's free project library shows that a tool with a good starter project gets adoption; the paid layer is an upgrade, not a gate on the first project. Our rule (no account for an activity; free printable) is stricter and better for trust.

6. **Video as a companion to steps, not a replacement.** Art for Kids Hub and Bob Ross show that a watch-along works for people who prefer to follow. Our rule is that photos and text are never *only* the instruction (DESIGN.md §2). Use video as an optional second channel with captions and transcripts.

7. **Printable templates as first-class content.** Michaels and Etsy both sell or give away printable templates; Etsy's craft-pattern category is one of its oldest digital-download segments. Printables are the bridge for people without screens or who are offline, which our mission explicitly requires.

8. **Teacher-led depth at a predictable price.** Domestika and Skillshare show that people will pay a subscription for a curated library with a clear teacher. Our equivalent should be a paid *collection* (curated packs with print sheets) rather than a paywall on the core library.

9. **Editorial reviewers with visible dates.** wikiHow's quality tiers and The Spruce's reviewer badges (verified only for home/garden boards, not crafts) show that visible review status builds trust. Our DESIGN.md §4B already requires author, reviewer and update dates. Keep it.

## 4. Content patterns

**Types and formats**
- **Step-by-step with a photo per step**: wikiHow, Instructables, Ravelry patterns. The strongest format for printable and low-vision use, because each step stands alone.
- **Watch-along video**: YouTube craft channels; Bob Ross; Michaels/Cricut video guides. Strong for children; weaker for quick reference.
- **Printable templates and packs**: Michaels, Etsy, Cricut. Our Activity Cards and collections map here.
- **Patterns and designs as data**: Ravelry's database format (materials, gauge, sizes). Equivalent for us is the structured activity schema.
- **Courses**: Domestika, Skillshare, Craftsy. Out of scope for the free core; relevant only as a future paid-collection model.

**Volume and cadence**
- Pinterest and Etsy publish at very high volume, so the signal is in search and saves rather than editorial curation.
- Ravelry added ~87,000 patterns in 2022 (official [6]). Volume is user-driven and continuous.
- Our constraint is quality over quantity. The DESIGN.md SEO anti-pattern (25 near-duplicate hubs) is a lesson from platforms that scaled by templated pages.

**Localization**
- wikiHow runs in 19 languages (Wikipedia [4]). Its traffic decline (§6) shows that translated breadth does not protect against search-engine changes.
- Domestika's catalog is ~95% Spanish (Class Central [17]). Language coverage follows the founding market; a multi-language launch should be deliberate.
- Canva's template count is unresolved: estimates range from 250,000 "design templates" to 4.5M+ (third-party). Do not quote any of them in the spec. Canva is strong on template-led onboarding regardless.

**SEO and structure**
- wikiHow and Spruce structure pages around the query ("how to X"). Our VISION.md search architecture is the same idea with better differentiation.
- Pinterest and Google AI Overviews surface pins for DIY queries (third-party claim, not verified). Structured, visible and up-to-date content is what AI and search systems can cite.

## 5. Games and interactive patterns

These platforms are mostly not game-led. Relevant interactive patterns:

- **Guided finder**: Cricut and Michaels offer filter-by-skill and filter-by-project. Our DESIGN.md §3 "Help me choose" with three visible filters (time, materials, type) is a calmer version of the same pattern.
- **Stash and tracking**: Ravelry's stash (materials owned) lets people match projects to supplies they already have. This suits our "what you have" promise (MISSION.md) and reduces buying pressure.
- **Watch-along progress**: Bob Ross marathons and Art for Kids Hub use a time-boxed, pleasant rhythm. Not a streak. A pleasant "pick up where you left off" is acceptable; shame-based streaks are not (rules: no dark patterns).

## 6. Gaps no one serves well (our openings)

1. **Adapted for ability and energy, not only for skill level.** Ravelry, Instructables, and wikiHow assume the maker can hold tools and sit at a table. Almost none filter for energy, seated/bedside use, low dexterity, or sensory calm. DESIGN.md §3 covers this; no leader in this set does it.
2. **Multi-generation activities as a first-class category.** Parent-grandparent-child activities are scattered across YouTube and Pinterest with no structure. Our audience definition is distinct.
3. **Trustworthy, free, printable, no-account.** Michaels and Cricut push purchase; Etsy monetizes the download; Pinterest monetizes attention. A free printable one-page card with no sign-up is an unfilled position.
4. **Stable, non-commercial source of truth.** wikiHow's traffic decline (about 35.5M monthly visitors in early 2025 versus a 100M peak in 2016; secondary source [5]) shows that open reference content is exposed to search-engine changes. Owning an activity catalogue and print assets off-platform is a resilience strategy.
5. **Honest about what a craft is for.** Art and craft platforms talk about "skills" and "projects"; few say "it is fine to stop." This is our editorial voice (DESIGN.md §5) and a differentiator.

Not an opening, but worth noting: Ravelry's pattern-seller model is proven but niche (knitting and crochet). Replicating the marketplace is out of scope for the free core.

## 7. Anti-patterns and risks to avoid

- **Monetization that cheapens trust.** Pinterest and Etsy show that ad-led and listing-led feeds drift toward paid placement. Ravelry's own founder post notes ads and affiliate income; its ad policy ("small, relevant, accessible") is a model worth reading, but it is from 2012 and should be treated as historical (fetched [8]).
- **Subscription lock-in.** Cricut Access content disappears when the plan ends (Cricut help [12]). Craftsy/Bluprint users were told to download classes before a shutdown (Variety [21]). Never sell content people cannot keep.
- **Feature churn.** Pinterest folded Idea Pins into standard Pins; creators lost multi-page support for a period (Pinterest community [23]). Our printed and printable outputs must remain stable.
- **Search dependency.** wikiHow and other open reference sites lost traffic when Google's AI Overviews expanded in 2024–2025. Attribution for that cause is not settled (an academic estimate of about 5% on English Wikipedia referrals is contested by Google [25]). Diversify distribution: printables, community, partners.
- **AI-generated content and trust.** Pinterest's community reports AI-generated pins increasing despite filters (third-party summary of Mashable; [24], [27]). Our activities must be human-tested. Do not publish generated steps or images as if they were verified.
- **Scale traps.** Templated SEO pages (DESIGN.md anti-pattern) and thin craft listings. wikiHow and Etsy both carry low-quality content at volume.
- **Medical and therapy language.** Art and craft platforms sometimes use "therapeutic" or "brain-boosting" language. Our rules forbid treatment claims unless reviewed by qualified professionals. This research did not find a leader whose claims are safe to copy.
- **Data and tracking.** Pinterest and Etsy monetize behavior data. Our no-tracker, minimal-data posture (DESIGN.md §7, §9) is a deliberate departure.

## 8. Sources

Access date for all sources: 2026-11-14.

1. Pinterest Q3 2026 results, via Nasdaq earnings-call coverage: https://www.nasdaq.com/articles/pinterest-pins-q3-2026-earnings-call-transcript
2. Pinterest Q3 2026 earnings summary (Quartr): https://quartr.com/events/pinterest-inc-pins-q3-2026_o0uP7Iy8
3. Social Media Today, Pinterest Q3 user growth: https://socialmediatoday.com/news/pinterest-reports-solid-user-growth-in-q3/873274
4. wikiHow (19 languages), Wikipedia: https://en.wikipedia.org/wiki/WikiHow
5. yespress.io, wikiHow profile (35.5M monthly visitors, early 2025; secondary, low reliability): https://yespress.io/wikihow
6. Ravelry, 2022 Community Stats: https://blog.ravelry.com/2022-community-stats
7. Ravelry, About (nearly half a million downloadable patterns): https://api.ravelry.com/about
8. Ravelry blog, "How does Ravelry make money?" (dated 2012-01-25; fetched): https://blog.ravelry.com/how-does-ravelry-make-money/
9. Sacra, Canva research (265M MAU estimate): https://sacra.com/research/canva
10. poster.ly, Canva guide (265M, citing TechCrunch Feb 2026; template figures): https://www.poster.ly/guides/canva-guide
11. Cricut, Join Cricut Access (price $9.99/mo or $95.88/yr): https://cricut.com/en/join-cricut-access
12. Cricut help, What is Cricut Access (last edited 2024-11-29): https://help.cricut.com/hc/en-us/articles/360009379454-What-is-Cricut-Access
13. Autodesk University blog, "Everyone Yes" 2012 (85,000 projects, stale): https://autodesk.com/autodesk-university/blog/EveryoneYes-Everyone-Designer-2012
14. vidIQ, Art for Kids Hub channel stats (~10.4M subscribers; undated snapshot): https://vidiq.com/youtube-stats/channel/@artforkidshub/
15. vidIQ, Bob Ross channel stats (6.2M, data 2025-06-15): https://vidiq.com/youtube-stats/channel/UCxcnsr1R5Ge_fbTu5ajt8DQ
16. Open Culture, all Bob Ross episodes free online (403 episodes, 31 seasons): https://openculture.com/2018/01/watch-every-episode-of-bob-ross-the-joy-of-painting-free-online.html
17. Class Central, 250 top Domestika courses report (2024; language split): https://classcentral.com/report/?p=80824
18. Fueler, Skillshare 2026 statistics (~$78M 2024 revenue; third-party): https://www.fueler.io/blog/skillshare-usage-revenue-valuation-growth-statistics
19. Michaels, Projects hub (free projects, video, templates): https://www.michaels.com/projects
20. Michaels MakerPlace, How-tos: https://www.michaels.com/makerplace/how-tos
21. Variety, NBCUniversal sells Bluprint assets to TN Marketing (2020): https://variety.com/2020/digital/news/nbcuniversal-sells-bluprint-tn-marketing-1234695739
22. Skillademia, Etsy statistics 2026 (third-party; low reliability): https://www.skillademia.com/statistics/etsy-statistics/
23. Pinterest Community, "Idea Pins are dead?" thread (Idea Pins folded into Pins): https://community.pinterest.biz/t/idea-pins-are-dead/2051
24. Pinterest Community, "Is AI-created content hurting growth on Pinterest in 2026?": https://community.pinterest.biz/t/is-ai-created-content-hurting-growth-on-pinterest-in-2026/46209.md
25. Search Engine Journal, what Wikipedia reveals about AI Overviews and traffic: https://www.searchenginejournal.com/what-wikipedia-reveals-about-ai-overviews-and-web-traffic/483237/
26. WebPronews, Pinterest CEO on visual search and Gen Z (39% company-cited claim; third-party): https://www.webpronews.com/pinterest-ceo-bill-ready-bets-on-visual-search-and-taste-driven-ai-to-capture-gen-z-shoppers/
27. Mashable-based summary of Pinterest AI-content filters (cited via the community thread in [24]; primary article not retrieved).

**Not retrieved:** wikiHow About page (blocked); Instructables About page (returned only a loading placeholder); The Spruce editorial policy (not found on thespruce.com); Etsy and Domestika official figures (not published in accessible form); Hobbycraft project pages (not checked).
