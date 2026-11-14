# Global specification: the world's first place to make something together

Status: proposal, 2026-11-14. This is a specification of what the website and app would need, not a claim that any of it is built, validated or approved for release. It extends, and never overrides, [MISSION](../../../MISSION.md), [VISION](../../../VISION.md) and [DESIGN](../../../DESIGN.md).

## The ambition in one paragraph

The biggest sites in the world won one question each: Wikipedia ("what is it?"), wikiHow ("how do I?"), Pinterest ("what could I make?"), Duolingo ("learn a language a bit each day"), Khan Academy ("learn it free"). The question nobody owns yet is the one in MISSION.md: **"What can we do together, right now, that this particular person can enjoy?"** — for a parent with a restless four-year-old, a daughter visiting her father with dementia, a teacher with twenty minutes, someone in bed who wants to make something, a grandparent and grandchild on a video call. These specs describe what creativeactivities.org and the Creative Activities app need to become that answer in every country: the biggest free, trustworthy, accessible library of creative activities, games and printables, fitted to the person and the moment, that sends people off the screen and into doing something together.

## Definition of #1 (how we will know)

"Number one" is not page views or time on site (VISION.md counter-metrics). It is all of the following, measured per launched language and cluster ([metrics](17-metrics-and-evidence.md)):

1. **Most activities started.** Confirmed "We tried this", prints, saves and shares per month are the north-star proxy, larger than any comparable site we can benchmark.
2. **First for the task.** Top-three organic positions and AI-answer citations for the defined task clusters in each launched language ([search](12-search-geo-distribution.md)).
3. **Most trusted.** Named authors and reviewers on every page, credentialed review where health is involved, zero unsubstantiated claims, accessibility defects near zero, and recommendation by partners: schools, libraries, care homes, clinicians, therapists' associations.
4. **Most useful for everyone.** Works for children, adults, older adults and people living with dementia; on a basic phone, a printer, offline, in their language, with assistive technology.
5. **Durable.** Returning households, partner adoption and a self-sustaining editorial and community pipeline, without ads inside activities or any dark pattern.

## Pillars

| Pillar | The job | File |
|---|---|---|
| **MAKE** | Crafts, art, making, from everyday materials | [07-pillar-crafting](07-pillar-crafting.md) |
| **GROW** | Kids and parenting: play, learning, sensory and family time | [08-pillar-parenting-kids](08-pillar-parenting-kids.md) |
| **CARE** | Older adults, dementia, bedside and care settings, caregivers | [09-pillar-older-adults-dementia](09-pillar-older-adults-dementia.md) |
| **CALM** | Creative wellbeing: art, music and writing for calm, connection, grief and stress, with an honest line around art therapy | [10-pillar-creative-wellbeing](10-pillar-creative-wellbeing.md) |
| **PLAY** | Games for every age, side by side or alone, on screen and on paper | [05-games](05-games.md) |
| **TOGETHER** (lens) | Intergenerational, group and remote-together versions of everything | Cross-cutting in every file |

## Files

| # | File | What it holds |
|---|---|---|
| — | [README](README.md) | This index, definition of #1, baseline |
| 01 | [Positioning and audiences](01-positioning-and-audiences.md) | Who, which situations, jobs to be done, competitive position |
| 02 | [Information architecture](02-information-architecture.md) | Taxonomy, facets, URL scheme, navigation at global scale |
| 03 | [Website features](03-features-web.md) | Every web feature (`WEB-`) |
| 04 | [App features](04-features-app.md) | Every app feature (`APP-`), mapped to existing `GM-` IDs |
| 05 | [Games](05-games.md) | Full game catalog (`GAME-`) and game design rules |
| 06 | [Content library](06-content-library.md) | Content types, templates, target volumes, editorial pipeline (`CNT-0xx`) |
| 07 | [MAKE: crafting](07-pillar-crafting.md) | Craft and art content program |
| 08 | [GROW: parenting and kids](08-pillar-parenting-kids.md) | Kids, family, sensory and school content |
| 09 | [CARE: older adults and dementia](09-pillar-older-adults-dementia.md) | Older adult, dementia, care-home and caregiver content |
| 10 | [CALM: creative wellbeing](10-pillar-creative-wellbeing.md) | Creative wellbeing and the art-therapy boundary |
| 11 | [Community and UGC](11-community-ugc.md) | "We made this", remixes, reviews, moderation (`COM-`) |
| 12 | [Search, GEO and distribution](12-search-geo-distribution.md) | SEO, AI answers, Pinterest/YouTube, partners (`SEO-`) |
| 13 | [Localization](13-localization.md) | Languages, cultural adaptation, review (`L10N-`) |
| 14 | [Trust, safety, accessibility, privacy](14-trust-safety-accessibility-privacy.md) | Requirements (`TSA-`) |
| 15 | [Platform and data](15-platform-data-architecture.md) | Architecture, data model, performance (`PLAT-`) |
| 16 | [Business model](16-business-model.md) | Sustaining a free core (`BIZ-`) |
| 17 | [Metrics and evidence](17-metrics-and-evidence.md) | What we measure and how (`MET-`) |
| 18 | [Roadmap](18-roadmap.md) | Phases S1–S4 with evidence gates |
| — | [research/](research/) | Cited research notes R1–R5 the specs rely on |

Writers follow [_WRITER_BRIEF.md](_WRITER_BRIEF.md): ID scheme, priorities (`P0`–`P3`), phases (`S1`–`S4`), status (`exists`, `partial`, `new`).

## Where we are today (baseline, checked 2026-11-14 on `main` at `dab0f10`)

**Website** (Astro, static, Cloudflare; `site/`)

- 2026 "cut paper" design system (DESIGN.md tokens, `studio*.css`), accessible by default: WCAG 2.2 AA checked by axe on key pages, higher contrast, larger text, reduced motion, print styles, RTL.
- **Activities**: 38 English activity cards (`/activity/<slug>/`) following DESIGN.md's data model: glance facts, materials, steps, variations (easier, seated, bedside, low-vision, nonverbal, less-sensory, with children, for a group, more collaborative), safety, stop note, print card with QR, HowTo JSON-LD. Byline says "not yet reviewed by an outside expert".
- **Finder** (`/activity/`): time, materials, type; optional setting, group, mess, energy, senses/calmer, without words, help level; "why it fits"; saved activities in the browser.
- **Hubs**: 4 English search hubs (activities for seniors, arts and crafts for seniors, bedside, grandparent–grandchild).
- **Packs**: 2 printable packs (five activities for a week, five quiet bedside activities).
- **Guides**: 88 English guides in three sections (activities 37, caregiving 41, brain health 10), machine-translated into 189 locale codes (unreviewed; most languages held from the search index).
- **Games**: 12 browser games: picture pairs, find the same, sort together, picture puzzle, finish the saying, large-print word search, coloring pages, conversation cards, photo pairs (local photos, never uploaded), picture bingo (printable), calm breathing, shadow match.
- **Tools**: Today ("What is hardest today?" quick answers with local notes), handout, pictures to print, for-organizations page, FAQ, editorial policy, safety and medical disclaimer.
- **Discovery**: sitemaps, llms.txt, schema.org (HowTo, FAQPage, ItemList, BreadcrumbList), IndexNow.

**App** (Flutter, `lib/`; "Creative Activities Together" on Android in review, iOS not submitted)

- Offline, no account: gentle picture matching (visible pictures, 4–12 tiles, no timer or score), picture puzzle, eight bundled picture packs (121 images), family photos kept on device (up to 24), shared viewing with optional prompts, Today, habits and gentle reminders, wellbeing content, comfort settings. Feature IDs `GM-001`… in [senior-first](../senior-first/feature-catalog.json).

**Not yet**: expert or credentialed review of any content, usability sessions, kids/parenting content, a crafts library beyond 38 cards, community features, accounts, any non-English activity cards, partner program, measured north-star data.

## How to use these specs

- **Precedence.** The priority and phase on each item, and the [roadmap](18-roadmap.md), are authoritative. The roadmap cut S1 to 40 items on 2026-11-14 (record in [phase-overrides.tsv](phase-overrides.tsv), full list in [id-index.tsv](id-index.tsv)). Where a file's prose or volume tables name an earlier phase, the item label and roadmap win.

- Choose work by **priority within phase**: finish `S1` `P0`s before any `S2` work; a pillar or language moves to `S3`/`S4` only when its evidence gate in [roadmap](18-roadmap.md) passes.
- Every built item updates its status here and in the owning file, with evidence (tests, review, usability) in the PR.
- Proposals here are not permission to make health claims, collect new data, or publish unreviewed translations.

## Open questions

- Brand architecture: does the app keep "Creative Activities Together" as its store name while the site covers all pillars?
- Which second language launches first in S3 (evidence in [localization](13-localization.md))?
- Who are the first named credentialed reviewers (art therapist, occupational therapist, early-years educator, dementia specialist)?
