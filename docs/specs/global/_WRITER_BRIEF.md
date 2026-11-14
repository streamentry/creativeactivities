# Writer brief: global specification (shared by all spec writers)

You are writing part of `docs/specs/global/`, the specification for what creativeactivities.org (website) and the Creative Activities app (iOS/Android, Flutter, in `lib/`) need in order to become the world's first place people go to find and do creative activities together — crafts and making, play and games, parenting and kids, older adults and dementia, intergenerational families, and creative wellbeing.

## Read before writing

1. `MISSION.md`, `VISION.md`, `DESIGN.md` (repo root). They are binding.
2. The research notes in `docs/specs/global/research/` (01–05). Cite them by file and source number, e.g. `[R3 §6]` = research/03, section 6.
3. The current baseline in `docs/specs/global/README.md` › "Where we are today". Never describe something as existing unless it is listed there or you checked the code.
4. Existing specs you must not contradict, only extend: `docs/specs/product.md`, `docs/specs/wellbeing.md`, `docs/specs/senior-first/` (app feature IDs GM-0xx), `docs/plan/README.md`.

## What "number one globally" means here (use these words consistently)

Not page views. "Number one" = the most-used and most-trusted answer to "What can we do together right now?", measured by: confirmed activity starts ("We tried this"), prints/saves/shares, organic search share for our clusters in each launched language, return visits by households, accessibility defect rate near zero, and partner adoption (schools, libraries, care homes, clinicians who recommend us). See README › Definition of #1.

## Hard rules

- Free core: every activity, guide, game and basic printable stays free with no login. Never gate essentials behind an account or payment.
- No dark patterns: no streak shame, no guilt notifications, no infinite feed as default, no ads inside activities or games, no pop-up before the first activity, no selling data.
- Art therapy is a credentialed profession. Self-guided content is "creative wellbeing" or "creative activities", never therapy, healing or treatment claims. Anything clinical needs a named credentialed reviewer and is labelled.
- Children: COPPA / UK Age Appropriate Design Code by default; no child accounts, no child-facing data collection, no public child images.
- Health: no diagnosis input required; never put health details in analytics.
- Accessibility: WCAG 2.2 AA minimum, 48px targets, 200% zoom, reduced motion, print, low bandwidth, screen readers.
- Honesty: separate fact (with source) from proposal and from estimate. Do not invent statistics. If a number is a target, call it a target.
- Sequencing follows VISION.md evidence gates: global coverage is earned cluster by cluster. Every item gets a phase.

## Shared vocabulary

- **Pillars**: MAKE (crafts, art, making), PLAY (games and playful activities), CARE (older adults, dementia, caregivers), GROW (kids and parenting), CALM (creative wellbeing), TOGETHER (intergenerational and groups — a cross-cutting lens, not a silo).
- **Activity**: one canonical, startable thing to do (the activity card). **Variation**: an adaptation of an activity (easier, seated, bedside, low-vision, nonverbal, less-sensory, for a group, with children…). **Hub**: a search-landing page for one intent. **Guide**: a long-form article. **Pack**: a printable collection. **Game**: an interactive browser/app experience. **Path**: an ordered sequence (e.g. a 4-week plan).

## ID scheme (unique across the whole folder)

| Prefix | Meaning | Owner file |
|---|---|---|
| `WEB-###` | Website feature | 03-features-web.md |
| `APP-###` | App feature (new; reference existing `GM-0xx` IDs where they apply) | 04-features-app.md |
| `GAME-###` | Game | 05-games.md |
| `CNT-###` | Content type or content program | 06-content-library.md and pillar files |
| `COM-###` | Community / UGC feature | 11-community-ugc.md |
| `SEO-###` | Search, GEO, distribution item | 12-search-geo-distribution.md |
| `L10N-###` | Localization item | 13-localization.md |
| `TSA-###` | Trust, safety, accessibility, privacy requirement | 14-trust-safety-accessibility-privacy.md |
| `PLAT-###` | Platform / data / engineering item | 15-platform-data-architecture.md |
| `BIZ-###` | Business model item | 16-business-model.md |
| `MET-###` | Metric | 17-metrics-and-evidence.md |

Pillar files (07–10) may define `CNT-` items in their own numeric block: 07 → CNT-700s, 08 → CNT-800s, 09 → CNT-900s, 10 → CNT-1000s. 06 uses CNT-001–099.

## Priority and phase (use both on every item)

- **Priority**: `P0` must have to be credible, `P1` needed to lead, `P2` strengthens the lead, `P3` later / only if evidence supports.
- **Phase** (VISION.md gates): `S1` small excellent library (now), `S2` prove repeat usefulness, `S3` expand by adjacency (new audiences/languages after their own evidence), `S4` global scale.
- **Status**: `exists` (in today's baseline), `partial`, `new`.

## Item template (tables are fine for short items; use this block for P0/P1 items)

```
### WEB-012 · Situation search ("my dad likes music but tires quickly")
Priority P1 · Phase S2 · Status new · Pillars: all
Why: one line tied to MISSION/VISION and a research citation [R1 §3].
What: 2–5 sentences, concrete behavior.
Acceptance: 3–6 testable bullets (include accessibility and no-dark-pattern checks).
Depends on: other IDs.
Risks / not doing: one or two bullets.
```

## Style

- Plain English, short sentences, US spelling to match the site.
- Markdown tables for catalogs. Each file starts with a one-paragraph purpose and a "Read with" line linking related files, and ends with "Open questions".
- Length: 1,500–4,000 words per file; catalogs can be longer. No filler, no marketing tone.
- Link files relatively (e.g. `[games](05-games.md#game-014)`).

Do not edit files you were not assigned. Do not commit. Reply with: files written, item counts per file, and anything you could not resolve (under 150 words).
