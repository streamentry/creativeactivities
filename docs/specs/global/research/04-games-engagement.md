# Games and engagement: research for creativeactivities.org

## 1. Scope and date

Research date: 2026-11-14. Scope: casual and creative games people play worldwide, brain-training claims and their regulatory history, dementia-friendly game products, creative and sandbox tools, co-play and turn-taking, and game accessibility standards. The goal is to inform the games catalog (the 12 existing browser games in `site/src/i18n/games.ts`) and the app roadmap without copying dark patterns.

Evidence rules applied: store and company figures are labelled as company-reported; third-party estimates are labelled as estimates; anything I could not verify is marked "unverified" and excluded from recommendations. Where a search returned only a secondary blog, I say so. Two names in the brief did not check out (see section 6). Nothing here is clinical advice.

Source-backed claims and the sources list are in section 9. Numbers in brackets refer to that list.

## 2. Landscape

| Name | Audience | Scale (source, as of) | Core features | Business model | What makes it win |
|---|---|---|---|---|---|
| Microsoft Solitaire Collection | All ages, casual | Microsoft: about 35M monthly active players, cited 2020 [1]. No 2025 official figure found. | Solitaire variants, daily challenges, light progression | Free with ads and optional paid tier (verify current model) | Zero learning curve, runs on a PC people already own |
| NYT Games (Wordle, Connections, Spelling Bee) | Adults | NYT total subscribers 13.35M at Q2 2026 [2]. NYT does not report Games separately [2]. Wordle "brought tens of millions of new users" per NYT, as reported secondarily [3]. | One puzzle per day, free daily tier, shareable spoiler-free result | Subscription bundle with news; Games sits inside it | One shared daily puzzle, a result that is shareable without spoilers |
| Jigsaw Planet / Jigsaw Explorer | All ages, families, schools | No verified user count found for Jigsaw Planet [4]. | Free jigsaws, user-made puzzles, piece-count choice | Free core, ads and paid tiers (verify) | Free, no account needed to start, lets people make their own puzzles |
| Happy Color (X-Flow) | Adults, mostly paint-by-number | Google Play 100M+ downloads [5]. Third-party estimates: 5.3M monthly active users Android, 18.1M iOS [5]. | Color-by-number, daily rewards, unlockable pictures | Free with in-app purchases; no ads on iOS per AppGoblin estimate [5] | Calm, one-tap fill, very large picture library |
| Lake: Coloring Book for Adults | Adults | Revenue estimate about $100K/month, third-party [6]. | Artist-made coloring pages, sharing | Subscription (weekly $2.99, monthly $9.99 per Adapty) [6] | Quality artwork, premium look |
| Toca Boca (Toca Life, Toca Boca World, Toca Boca Jr) | Children, roughly 3 to 10 | Not verified at scale in this pass. | Open-ended role-play, no fixed rules | Free with optional purchases; store listing says no third-party ads [7] | Open-ended play, no fail state |
| Duolingo | Adults, language learners | Company FY2025 10-K, reported secondarily: about 43M daily users with 7+ day streaks [8]. Unverified. | Streaks, XP, leagues, streak freeze | Freemium subscription | Habit formation, very frequent short sessions |
| Lumosity / Elevate | Adults, cognitive "fitness" | Lumosity store rating 4.7 (131K) and Elevate 4.8 (546K) per the store listings in our competitor log [9]. | Scored training games, progress charts, subscription | Subscription | Strong marketing, progress feedback |
| Memory Lane Games | Dementia (patient, caregiver, professional) | 50K+ Google Play installs (store snippet) [10]. | 3,000+ reminiscence and trivia games, no timers, no wrong answers, offline | About $9.99/month, 14-day trial [9] | Low-frustration design, large library |
| Forget-Me-Not: Dementia App | Dementia, families | 3.7 (3 ratings), iOS [9] | Family-photo card matching, no timer or penalty, PIN caregiver mode | Free, ad-free [9] | Family photos, no account |
| Tovertafel (Tover) | Care homes | Quote-only device plus subscription [9] | Projected group games on a table | Hardware plus subscription | Group play in one space; evidence small (see section 5) |
| SingFit | Dementia, singing groups | 4.2 (17) iOS; about $4.99/month per third-party report [9] | Guided singing, group and one-to-one editions | Subscription | "Smiles and pure joy" in reviews [9] |
| Chrome Music Lab (Google) | Children, musicians | Free, runs in the browser, Apache-2.0 open source [11] | Visual and sound experiments | Free, no account | Immediate play with no install |
| Minecraft Education (creative mode) | Students | Chase the Clouds update (July 2025) reorganized the Creative Inventory and world creation; Copper update focused on building [12] | Build, code, spectator mode | Institutional license | Open-ended building with teacher controls |

Common thread: the most-used products are short, daily or session-based, with a single clear goal and no required login. The only dementia products with meaningful volume are ones that remove time pressure and wrong answers.

## 3. Feature patterns worth adopting

1. **One daily, shared puzzle, with no punishment for missing a day.** NYT Wordle and Connections show a single daily item everyone shares. Adopt the daily item. Reject the loss framing. Show "today's card" and an archive of past cards so missing a day costs nothing.

2. **Spoiler-free result sharing.** The emoji grid is widely credited for Wordle's spread [3]. Adopt a result format that shares effort and completion without answers, e.g. "Made 6 pairs with my grandson" as a card, not a score. Keep it opt-in and avoid any identifying data.

3. **Collections over streaks.** Duolingo's streak works for many users but is the most-cited manipulative mechanic in the set [8]. Its own team reportedly split streak rules from daily goals to improve retention [8]; the exact figures are secondary and unverified. Our adaptation: a collection ("16 activities tried, 4 favorites"), not a counter that breaks. Stored progress is per-device and never shown as a failure.

4. **Frustration-free difficulty.** Memory Lane Games removes timers and wrong answers [9]. Forget-Me-Not uses no timer and no penalty with an adaptive quiz [9]. Xbox Accessibility Guideline 108 asks for difficulty options because games without them can block players entirely [13]. Adopt: difficulty tiers by piece count or grid size, hints after a pause instead of after a miss, and "keep going" as the default with no score on screen.

5. **Quiet offline play.** Memory Lane Games offers offline mode [9]. AlzBuddy's sound module fails on weak Wi-Fi [9]. Adopt: every game works offline after first load, and printable counterparts exist for each.

6. **Free core, no account.** Solitaire, Jigsaw Planet and Chrome Music Lab start without an account [1][4][11]. Our mission already requires this [MISSION.md]. Keep it.

7. **Make-your-own.** Jigsaw Planet's user-made puzzles and Minecraft's creative mode both let people author content [4][12]. This is a high-value route to content scale and to "one idea, many adaptations".

8. **Accessibility tiers as a prioritization aid.** The Game Accessibility Guidelines sort items into basic, intermediate and advanced, and say these tiers are a prioritization aid, not a compliance target [14]. Use the basic list as an acceptance checklist for each game.

## 4. Content patterns

- **Format and length.** Most casual games in the set are sessions of 1 to 10 minutes (solitaire hands, Wordle, Connections). Our activity cards should state duration and setup time; games should have an obvious stopping point at every level.
- **Volume and cadence.** Happy Color's advantage is picture volume (third-party estimate of large libraries) [5]. Our advantage is adaptation: one game, many fits. Plan cadence around seasons and occasions (family visits, school holidays) rather than daily feeds, consistent with MISSION's "startable, not scrollable" principle.
- **Themes that travel.** Memory Lane Games' 3,000+ items are reminiscence and trivia across years and topics [9]. Reviews ask for family photos and familiar music rather than generic images [9]. Our content should let a family add their own photo or local item, and never assume one culture's holidays.
- **Adult look.** Reviews of a dementia-specific word search said it was "too basic and toddler-like" and asked for "a simpler, more adult-looking game" [9]. Use adult design language for adult audiences even when the mechanic is simple.
- **SEO and structure.** Game pages should carry a plain description, a "How to play", adaptations, materials list, and a printable version. Schema and hreflang are already in the codebase.

## 5. Games and interactive patterns

**Evidence on brain training.** This is the sensitive area and must be written carefully.

- The FTC settled with Lumos Labs (Lumosity) in January 2016 for $2 million. The FTC said the company's claims included that its games delay age-related cognitive decline and protect against mild cognitive impairment. The settlement required no health or performance claims without competent and reliable scientific evidence, and an easy way to cancel auto-renewals. A $50 million judgment was suspended [15][16].
- Simons et al. (2016) reviewed the peer-reviewed studies cited by leading brain-training companies. They found reliable improvement on trained tasks, weaker transfer to related tasks, and little evidence of real-world benefit. Inadequate control groups were a common problem [17].
- The 20-year follow-up of the ACTIVE trial (Coe et al., 2026, observational analysis of a randomized trial) found about 25% lower dementia incidence in the speed-of-processing arm with booster sessions. Memory and reasoning arms showed no significant effect. Dementia was identified from Medicare claims, not cognitive testing [18]. This is the strongest positive result, and it is still a specific intervention, not a general claim that games prevent dementia.
- Memory Lane Games' randomized pilot (ISRCTN10235611, Isle of Man) was small, with 12 completers against a planned 30 pairs; the sponsor describes results as mixed and not conclusive [19]. The company's "92% of caregivers feel more relaxed" figure is self-reported marketing, not the trial's primary outcome.
- Tovertafel's 2024 study (Konrad et al., 25 residents, 8 weeks) was single-site and uncontrolled; the authors warn results may be overestimated [20].
- Singing: the UK PRESIDE feasibility study (72 participants) found descriptive trends but was not powered for effectiveness [21]. A 2025 review of 14 studies (n=361) found mood and agitation gains but no strong quality-of-life effect [21].

**Implication for us.** Describe games as creative, recreational, enjoyable, or supportive. Never write "improves memory", "slows dementia", "reduces agitation" or "keeps the brain sharp". Those are the FTC's trigger phrases and the FDA general wellness policy's exclusion list [22]. The mission's "no false promise of therapeutic benefit" rule [MISSION.md] is also the safest legal position.

**Co-play and turn-taking.** Tovertafel's group play is the closest product match, but it is hardware and subscription-based [9]. Relish and Memory Lane Games offer caregiver guidance alongside the games [9][23]. For two people side by side, the proven pattern is shared control of one screen or one printed sheet, with turn markers and no timer.

**Creative and sandbox play.** Chrome Music Lab shows that a free, no-install, open source experiment can reach a huge audience with zero accounts [11]. Minecraft Education's creative tools show that open building works when adults can set the scope [12]. Toca Boca's open-ended "no rules" framing is the same principle for young children, with the caveat that its store and data practices need checking before we cite it as a model [7].

**Adaptive difficulty without failure.** Use: pieces, grid size and hint timing as the only knobs; no visible score; a "rest" button that saves place; and XAG 109's objective clarity (a clear view of what is left and what is done) to reduce cognitive load [13].

## 6. Gaps and checked-but-unverified items

**Gaps no one serves well:**
- Ad-free, no-subscription, offline, adult-looking dementia games with family photos. Competitor reviews name each of these gaps [9]. This is our strongest open space, and it matches MISSION's "free core" and "no account" rules.
- Printable plus digital pairs for the same game, with the same rules. We found no leader doing this well.
- Intergenerational co-play that adults and children can both pick up. Most products are single-audience.
- Multilingual, low-bandwidth, reviewed content. Most dementia games are English-only [9].

**Checked and unverified (do not quote without a fresh source):**
- "It's Never 2 Late": no results found in our search. Drop it from the list unless a store link is provided.
- Relish: the company makes dementia products and a caregiver app [23]. We found no evidence of a Relish Wii product or a "Rosie Jenkins" connection.
- SingFit: the store listing is in our competitor log [9], but we found no SingFit-specific study. The studies above are on singing in general.
- Solitaire 2025 user numbers, Duolingo streak-freeze percentage (0.38%) and "streak freeze reduced churn by 21%": secondary sources only; not used.
- Elevate "90%+ report improved mental sharpness": the claim appears in our competitor log [9]. I could not re-verify it, and no FTC action against Elevate was found [16].

## 7. Anti-patterns and risks

- **Streak shame and loss framing.** Duolingo's streak is effective and also the mechanic most users describe as pressure [8]. MISSION and DESIGN forbid shame streaks [DESIGN.md section 9].
- **Brain-training claims.** The FTC action is the template for what regulators object to [15]. Avoid all cognitive-outcome language.
- **Subscription walls for essential activities.** Memory Lane Games' subscription is the top stated drawback [9].
- **Ads.** Interstitial and rewarded ads are poor fits for dementia and childhood audiences. The category-leader doc already rejects them [category-leader.md].
- **Children's data.** The UK Children's Code sets high-privacy defaults (Standard 7) and bans nudges that push children to give data or weaken privacy (Standard 13). It applies to online games [24]. Apply this to all ages, not only children.
- **Difficulty that blames the player.** Reviews of "too hard" and "too basic" dementia content show both errors are common [9].
- **Unstable offline and web dependency.** Broken modules on weak Wi-Fi [9].
- **Fake-looking clinical badges.** Avoid anything that looks like a medical rating.
- **Accessibility as an afterthought.** The GAG and XAG are free; we should test each game against the basic list before launch [13][14].

## 8. Proposed game concepts (25 to 40)

Each concept: mechanic, who it suits, why it fits MISSION. All are casual, creative, or supportive; none claims therapy. Concepts marked (print) need a printable counterpart.

**For children (roughly 3 to 10, with an adult)**
1. **Sticker scene builder**: drag stickers onto a scene, no scoring. Suits young children and a grandparent. Why: open-ended, no fail state, fits "one idea, many adaptations". (print)
2. **Sort-it-together (existing, extend)**: add a "one large item" mode for toddlers. Suits ages 2 to 5. Why: keeps sensory-friendly options on the same page.
3. **Sound loop maker**: tap a grid to layer sounds (Chrome Music Lab style, built in-house). Suits children and music-loving adults. Why: free, offline, no account.
4. **Story dice**: roll pictures and talk the story aloud. Suits families with mixed reading levels. Why: conversational, no literacy requirement. (print)
5. **Color-the-day weather chart**: fill a month grid by daily weather or mood with no judgement. Suits early learners and parents. Why: reflective, no streak.
6. **Shadow match (existing, add family photo mode)**: parents add photos. Suits intergenerational families. Why: personal content, offline.

**For adults and families**
7. **Daily shared card**: one picture-based puzzle each day, archive kept, no missed-day penalty. Suits general adults. Why: captures the Wordle pattern without guilt. (print)
8. **Spoiler-free result card**: shareable grid showing effort ("4 pairs, 2 new names"). Suits families sharing with relatives. Why: sharing without data.
9. **Jigsaw from your photo**: upload a photo to make a puzzle locally, never stored. Suits everyone. Why: Jigsaw Planet's maker model, with privacy.
10. **Paint-by-number-lite**: large, calm fill for seated adults with fine-motor limits. Suits older adults and bedside use. Why: relaxed, adjustable grid. (print)
11. **Collage collaboration board**: two players place cut-outs on a shared board, taking turns. Suits couples, siblings and carers. Why: co-play, one idea many adaptations.
12. **Connections-style word groups with picture clues**: group four pictures by theme, no timer. Suits adults including people with reading difficulty. Why: NYT-style daily puzzle without the pressure. (print)
13. **Seasonal puzzle pack**: a monthly theme (harvest, winter) with a rest-day option. Suits all ages. Why: calendar rhythm, not a streak.

**For older adults and dementia (adult-looking, no timers, no wrong answers)**
14. **Reminiscence card match**: match family-photo cards with a gentle hint after a pause, never a miss count. Suits people at any stage and carers. Why: frustration-free, personal, offline. (print)
15. **Who is this? (photo recall, optional)**: a single photo with three names, switch to "tell me about them" mode for later stages. Suits middle and early stages. Why: forced recall is the adaptive mode Forget-Me-Not uses [9], made optional.
16. **Music memory choices**: pick a familiar decade of songs and tap to play; no quiz. Suits people who enjoy music. Why: consent-led, no scoring. Requires licensed or public-domain audio.
17. **Scrapbook builder**: a caregiver adds photos and captions to a book the person can page through. Suits carers and family. Why: personal content, no account. (print)
18. **Large-target sort**: sort items into two large bins with big targets and no time limit. Suits people with low vision or tremor. Why: adjustable targets from GAG basic list [14].
19. **Seated ball-toss**: a slow, gentle bean-bag game for two people at a table. Suits people with limited mobility. Why: physical, co-play, printable tokens. (print)
20. **Singing sheets**: printable lyric sheets with large type and a "start with chorus" option. Suits group and one-to-one singing. Why: low tech, no claims about outcomes; no subscription.
21. **Garden planner (sit-down)**: choose plants from pictures, lay out a plot. Suits people who enjoyed gardening. Why: meaningful choices, no correct answer.
22. **Rest button**: every game saves place and offers a calm exit screen. Suits all audiences. Why: honours "adapt or stop without pressure". Cross-cuts all games.

**For intergenerational and co-play**
23. **Two-hand drawing duet**: two people draw on one canvas with alternating turns and color choice. Suits grandparents and children. Why: turn-taking, creative, no winners.
24. **Story chain**: each player adds a sentence or picture in turn. Suits any mixed-age pair. Why: conversation over screen. (print)
25. **Build-it-together grid**: two players build a shared pattern from alternating pieces. Suits siblings and carers. Why: co-play with no competition.
26. **Memory pairs, co-op mode**: partners find pairs together with one shared score that is never shown as failure. Suits couples, carers and children. Why: co-op, Tovertafel-style group feel for two.

**Creative and sandbox**
27. **Pattern maker**: tile-based drawing that exports to a printable sheet. Suits all ages. Why: creation, print counterpart.
28. **Mini sound garden**: draw a line and it becomes a sound. Suits musicians and children. Why: free, open source approach like Chrome Music Lab [11].
29. **Stop-motion frame maker**: take photos of paper cut-outs, play back as a short clip, saved locally. Suits families and classrooms. Why: creative output, no feed.

**Accessibility-first and modes**
30. **Low-bandwidth pack**: every game above as a single-file HTML under a set size budget, playable offline. Suits rural and low-income users. Why: MISSION's "accessible by default" and low-bandwidth delivery.
31. **Large-print and high-contrast theme**: switch every game's theme in one setting. Suits low vision and older adults. Why: DESIGN accessibility rules.
32. **One-switch mode**: play any game with a single button or keyboard key. Suits people with motor limits. Why: AbleGamers' accessibility focus [25] and XAG input guidance.

**Optional or later**
33. **Photo timeline**: family photos placed on a yearly timeline, with notes. Suits families and carers. Why: reminiscence without a quiz. Requires consent on photos.
34. **Local-language word search (existing, extend with community word lists)**: reviewed by native speakers before publishing. Suits all languages where we have review. Why: translation with human review.
35. **Quiet shapes puzzle**: slow tangram-style shapes, no timer, with a picture hint. Suits adults who like geometry. Why: calm, no streak.
36. **Co-decorate a card**: two people decorate a printed card for a birthday. Suits intergenerational families. Why: physical, social, print-first. (print)
37. **Pick-a-picnic**: choose food and activity pictures for a plan, then play a matching game. Suits care planning in a playful way. Why: planning with consent. (print)
38. **Calm breathing (existing, reframed)**: keep as a pause activity, described only as relaxation. Suits all audiences. Why: wellness claim allowed only as relaxation [22], no therapy language.

Priority if we build only five: 14 (reminiscence card match), 7 (daily shared card), 23 (two-hand drawing), 30 (low-bandwidth pack), 22 (rest button). These cover the mission's core needs with the lowest risk.

## 9. Sources

Accessed 2026-11-14 unless noted. Items marked [secondary] are from aggregator or blog pages.

1. Microsoft Solitaire Collection, 35M monthly players (2020 figure) via GamePressure: https://www.gamepressure.com/editorials/the-most-popular-games-in-the-world-what-titles-do-the-most-peopl/microsoft-solitaire/za1a8 [secondary]
2. Analyst coverage of NYT Q2 2026 results (13.35M subscribers): https://www.newsbytesapp.com/news/business/new-york-times-adds-280000-digital-subscribers-totals-1335-million/tldr [secondary]; NYT not reporting Games separately: https://www.barchart.com/story/news/1896237/the-new-york-timess-q1-earnings-call-our-top-5-analyst-questions [secondary]
3. Wordle share grid and acquisition: https://wiki.riteme.site/wiki/Wordle [secondary]; NYT acquisition and "tens of millions" claim: https://kaweah.freedombox.rocks/kiwix/wikipedia_en_all_maxi_2023-10/Wordle [secondary]
4. Jigsaw Planet description: https://www.kidssearch.com/Jigsaw-Planet.php [secondary]
5. Happy Color Google Play listing: https://play.google.com/store/apps/eventdetails/4828933274205464050 ; third-party estimates: https://mixrank.com/playstore/apps/com.pixel.art.coloring.color.number ; https://appgoblin.info/apps/com.pixel.art.coloring.color.number/keywords [third-party estimates]
6. Lake coloring app, revenue and pricing estimates: https://adapty.io/paywall-library/lake-coloring-book-for-adults ; https://screensdesign.com/apps/lake-coloring-book-for-adults/ [third-party estimates]
7. Toca Boca World store listing (no third-party ads, open-ended): https://apps.apple.com/app/1208138685 ; Toca Boca Jr Classics listing: https://apps.apple.com/app/toca-boca-jr-classics/id6741918757 ; data and purchase practices guide: https://www.elternguide.online/en/free-play-and-creativity-with-the-apps-from-toca-boca/ [third-party]
8. Duolingo streak research and figures: https://blog.duolingo.com/duolingo-streak-research/ (not fetched; search snippet only); secondary analysis: https://www.openloyalty.io/insider/how-duolingos-gamification-mechanics-drive-customer-loyalty [secondary, unverified]
9. Competitor log, store ratings, prices and reviews (our own file, researched 2026-10-30/31): /Volumes/SANDISK-Data/creativeactivities-2026/docs/plan/competitors.md; Memory Lane Games store listing: https://apps.apple.com/us/app/id1517193093
10. Memory Lane Games installs and positioning (our file): /Volumes/SANDISK-Data/creativeactivities-2026/docs/strategy/category-leader.md
11. Chrome Music Lab, Google blog: https://blog.google/products/chrome/introducing-chrome-music-lab/?m=1 ; open source repository listing: https://awesome.ecosyste.ms/projects/github.com%2Fgooglecreativelab%2Fchrome-music-lab [secondary for stars count]
12. Minecraft Education Chase the Clouds update: https://education.minecraft.net/en-us/blog/chase-the-clouds-update ; Copper update: https://education.minecraft.net/blog/copper-collaborate-and-compete
13. Xbox Accessibility Guidelines: XAG 108 (difficulty options): https://learn.microsoft.com/vi-vn/gaming/accessibility/xbox-accessibility-guidelines/108 ; XAG 109 (objective clarity): https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/109 ; index: https://devdocs.xbox.com/build/game-principles/accessibility/xbox-accessibility-guidelines
14. Game Accessibility Guidelines, basic and advanced tiers: https://gameaccessibilityguidelines.com/basic/ ; https://gameaccessibilityguidelines.com/advanced/ ; purpose: https://gameaccessibilityguidelines.com/why-and-how/ (snippet)
15. FTC press release, Lumosity settlement, 5 January 2016: https://ftc.gov/news-events/press-releases/2016/01/lumosity-pay-2-million-settle-ftc-deceptive-advertising-charges
16. Summary of the FTC action and terms: https://trainingindustry.com/press-release/content-development/lumosity-to-pay-2-million-to-settle-ftc-deceptive-advertising-charges-for-its-brain-training-program/ [secondary]; Elevate 2016 coverage: https://www.macrumors.com/2016/01/05/lumosity-brain-training-false-advertising/ [secondary]
17. Simons, D. J., et al. (2016). Do "brain-training" programs work? Psychological Science in the Public Interest, 17(3). DOI 10.1177/1529100616661983. Summary: https://las.illinois.edu/news/2016-10-03/researchers-little-evidence-brain-training-games-yield-real-world-benefits [secondary]
18. Coe, N. B., et al. (2026). ACTIVE 20-year follow-up. Alzheimer's & Dementia: Translational Research and Clinical Interventions. DOI 10.1002/trc2.70197. Summary: https://ufhealth.org/news/2026/decades-later-brain-training-lowers-dementia-risk [secondary]; https://www.psychiatrist.com/news/brain-training-could-delay-dementia-for-years/ [secondary]
19. Memory Lane Games pilot, ISRCTN10235611: https://www.isrctn.com/ISRCTN10235611 ; sponsor trial summary: https://www.memorylanegames.com/wp-content/uploads/2024/10/clinical-trial-summary-us-1-compressed.pdf [sponsor]
20. Konrad et al. (2024). Effects of the Tovertafel on apathy, social interaction and social activity. Frontiers in Neurology 15. DOI 10.3389/fneur.2024.1455185: https://www.frontiersin.org/articles/10.3389/fneur.2024.1455185/full
21. PRESIDE singing feasibility study and 2025 systematic review: https://vbn.aau.dk/en/publications/pilot-randomised-evaluation-of-singing-in-dementia-preside-protoc ; https://www.research.lancs.ac.uk/portal/en/publications/the-effects-of-singing-interventions-on-quality-of-life-mood-and-levels-of-agitation-in-communitydwelling-people-living-with-dementia(e8f705b7-be7f-4338-8710-e91879d2a55f).html
22. FDA General Wellness policy (final, 2026-01-06), as summarized in our competitor log: https://www.fda.gov/media/90652/download (not fetched in this pass; summary per /Volumes/SANDISK-Data/creativeactivities-2026/docs/plan/competitors.md)
23. Relish: products and caregiver app: https://www.relish-life.com/blog/dementia-apps ; https://livewell.bathnes.gov.uk/supporting-adults-live-independent-lives/diagnosed-conditions/dementia-support/relish
24. ICO Age Appropriate Design Code (Standards 7 and 13): https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services ; GOV.UK child online safety guidance: https://gov.uk/guidance/child-online-safety-data-protection-and-privacy
25. AbleGamers programmes (Accessible.Games, APX, Player Panels): https://ablegamers.org/our-work/ [snippet]; founding details: https://www.techradar.com/news/how-ablegamers-the-xbox-adaptive-controller-and-apx-are-helping-millions-of-disabled-gamers-play-the-games-they-love [secondary]

Not verified and not cited for claims: "It's Never 2 Late" (no results); Relish Wii or "Rosie Jenkins" (no results); SingFit-specific studies (none found); Solitaire 2025 user figures; Duolingo streak-freeze percentages.
