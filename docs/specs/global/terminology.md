# Dementia terminology glossary (draft)

Status: draft, unreviewed. Drafted 2026-11-19 from the repository's own research.
Every row is unreviewed until a named native reviewer signs it. Reviewer is
"none yet" on every row. "Reviewed" has the meaning in
[native review](../../engineering/native-review.md): a named reader checked the
surfaces and the evidence is a link to their sign-off.

## Purpose

This glossary records, per launched language, the public term for dementia and
for Alzheimer's, the term people type into store and web search, and the term
to avoid. It is the source for [L10N-007](13-localization.md). Titles and
headings use the public term. Body text may explain the clinical term once.

How L10N-008 (the brand and name check) should use it: scan titles, headings
and store names for each "Term to avoid", and compare each title or heading with
its "Public term for dementia" column. Report mismatches; do not rewrite them
from this file, because the public term is a native reviewer's decision.

## Rules for this draft

- A cell is filled only from a source in the repository, and the source is named
  in that row. A cell that no source covers says "not in sources". Nothing here
  was translated or filled from general knowledge.
- "Site uses today" is the exact string from the site's own translation file,
  at the key shown. The key is `sections.caregiving.label` (the "Dementia care"
  section label) unless a row says otherwise.
- Languages with no sourced term information are not tabled: pt-PT (only a
  population figure, and a separate locale later, per
  [detail plan](../../plan/detail.md)), ru (no term in the research), hi and the
  other Indic locales (research says Hindi search content is essentially
  absent), th, uk and id (native review notes about other things, not terms).
- Across all languages, "patients" is avoided in copy
  ([L10N-007 risks](13-localization.md)).
- Mismatches between the site and this glossary are listed after the tables.
  They are for the maintainer and the reviewer, not fixed here.

## Languages with sourced entries

### en

| Language (code) | Public term for dementia | Term for Alzheimer's | Term people search with | Term to avoid | Site uses today | Source | Reviewer | Date | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| en | Dementia | Alzheimer's | dementia activities; dementia games; alzheimers activities (US worksheet, English only) | patients (L10N-007 risks) | Dementia care (`sections.caregiving.label`, `site/src/i18n/ui/en.json`) | `docs/plan/language-markets.md` §1; `docs/strategy/keyword-research.csv`; `docs/specs/global/13-localization.md` | none yet | 2026-11-19 | "Dementia is neutral in all four" countries (language-markets §1). The search terms come from the English worksheet only. |

### ja

| Language (code) | Public term for dementia | Term for Alzheimer's | Term people search with | Term to avoid | Site uses today | Source | Reviewer | Date | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ja | 認知症 | not in sources | 認知症 アプリ; 認知症 ゲーム 高齢者 | 痴呆; ボケ | 認知症のケア (`sections.caregiving.label`, `site/src/i18n/ui/ja.json`) | `docs/specs/global/13-localization.md` (L10N-007); `docs/plan/language-markets.md` §1, §5; `docs/plan/detail.md` (locale row 3) | none yet | 2026-11-19 | "痴呆 was replaced by 認知症 in 2004; residual family stigma" (language-markets §1). detail.md: "認知症 is the official, accepted term; never 痴呆 or ボケ; never 予防" (予防 is a prevention claim, not a term). |

### zh-Hant

| Language (code) | Public term for dementia | Term for Alzheimer's | Term people search with | Term to avoid | Site uses today | Source | Reviewer | Date | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| zh-Hant | 失智症 (Taiwan); 認知障礙症 or 腦退化症 (Hong Kong) | not in sources | 失智症 遊戲; 長輩 遊戲 app; 懷舊治療 | 老年痴呆 | 照顧 (`sections.caregiving.label`, `site/src/i18n/ui/zh-Hant.json`) | `docs/plan/language-markets.md` §1, §5; `docs/plan/detail.md` (locale row 5) | none yet | 2026-11-19 | "Taiwan uses 失智症 (criticized as 'loss of wisdom', rename debated, not adopted)" (language-markets §1). detail.md: "never 老年痴呆". |

### zh-Hans

| Language (code) | Public term for dementia | Term for Alzheimer's | Term people search with | Term to avoid | Site uses today | Source | Reviewer | Date | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| zh-Hans | not in sources (no recommended public term; 认知障碍症 proposed in 2025, not adopted) | 阿尔茨海默 (search phrase) | 认知症 游戏; 阿尔茨海默 游戏 | 老年痴呆 | 照护 (`sections.caregiving.label`, `site/src/i18n/ui/zh-Hans.json`) | `docs/plan/language-markets.md` §1, §5; `docs/plan/detail.md` (locale row 5); `docs/engineering/native-review.md` (Known points) | none yet | 2026-11-19 | "Colloquial 老年痴呆 ('senile idiocy') is stigmatizing; a 2012 rename campaign stalled" (language-markets §1). native-review: the listing uses "the formal term for dementia rather than the older, more stigmatizing everyday one". The formal term itself is not named in the research. |

### de

| Language (code) | Public term for dementia | Term for Alzheimer's | Term people search with | Term to avoid | Site uses today | Source | Reviewer | Date | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| de | Demenz (neutral) | not in sources | Demenz Spiele; Beschäftigung für Menschen mit Demenz; Gedächtnistraining Senioren; Demenz App Angehörige | not in sources | Demenzbegleitung (`sections.caregiving.label`, `site/src/i18n/ui/de.json`) | `docs/plan/language-markets.md` §1, §5; `docs/plan/detail.md` (locale row 4) | none yet | 2026-11-19 | "Demenz is neutral; Beschäftigung für Menschen mit Demenz is the phrase" (language-markets §1). |

### es

| Language (code) | Public term for dementia | Term for Alzheimer's | Term people search with | Term to avoid | Site uses today | Source | Reviewer | Date | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| es | demencia (clinical but usable) | alzhéimer | juegos para personas con alzhéimer; actividades para personas con demencia; estimulación cognitiva mayores; app cuidadores alzhéimer | not in sources | Cuidado en la demencia (`sections.caregiving.label`, `site/src/i18n/ui/es.json`) | `docs/plan/language-markets.md` §1, §5; `docs/plan/detail.md` (locale row 2); `docs/specs/global/13-localization.md` (L10N-007) | none yet | 2026-11-19 | "Demencia is clinical but usable; searches center on alzhéimer" (language-markets §1). L10N-007: "Spanish searchers type alzhéimer". |

### fr

| Language (code) | Public term for dementia | Term for Alzheimer's | Term people search with | Term to avoid | Site uses today | Source | Reviewer | Date | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| fr | maladie d'Alzheimer et maladies apparentées, or troubles cognitifs (both named as alternatives) | Alzheimer | jeux pour personnes atteintes d'Alzheimer; activités Alzheimer; stimulation cognitive seniors; application aidants | démence | Accompagner la démence (`sections.caregiving.label`, `site/src/i18n/ui/fr.json`) | `docs/plan/language-markets.md` §1, §5; `docs/plan/detail.md` (locale row 6); `docs/specs/global/13-localization.md` (L10N-007) | none yet | 2026-11-19 | "Démence is avoided in public copy; use maladie d'Alzheimer et maladies apparentées or troubles cognitifs" (language-markets §1). |

### ko

| Language (code) | Public term for dementia | Term for Alzheimer's | Term people search with | Term to avoid | Site uses today | Source | Reviewer | Date | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ko | not in sources as a chosen term; 인지저하증 proposed in a 2025 bill, not enacted as of September 2025 | not in sources | 치매 어르신 게임; 기억력 게임 어르신; 회상 활동 | 치매 (in titles; searchers still type it, see Reason) | 치매 돌봄 (`sections.caregiving.label`, `site/src/i18n/ui/ko.json`) | `docs/plan/language-markets.md` §1, §5; `docs/plan/detail.md` (locale row 8) | none yet | 2026-11-19 | "치매 is explicitly stigmatized: 43.8% dislike it in a 2023 ministry survey" (language-markets §1). detail.md: "never in the title". The same research lists 치매 search phrases (§5), so the avoid rule is for titles; the reviewer decides about search keywords. |

### pt-BR

| Language (code) | Public term for dementia | Term for Alzheimer's | Term people search with | Term to avoid | Site uses today | Source | Reviewer | Date | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| pt-BR | Demência (acceptable) | Alzheimer (dominates search) | jogos para idosos com demência; atividades para Alzheimer; estimulação cognitiva idosos | not in sources | Cuidados (`sections.caregiving.label`, `site/src/i18n/ui/pt-BR.json`) | `docs/plan/language-markets.md` §1, §5; `docs/plan/detail.md` (locale row 7) | none yet | 2026-11-19 | "Demência acceptable; Alzheimer dominates search" (language-markets §1). |

### it

| Language (code) | Public term for dementia | Term for Alzheimer's | Term people search with | Term to avoid | Site uses today | Source | Reviewer | Date | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| it | Demenza (neutral) | Alzheimer (used in marketing) | giochi per anziani con demenza; attività per malati di Alzheimer; "giochi per anziani" is the live phrase | not in sources | Assistenza per la demenza (`sections.caregiving.label`, `site/src/i18n/ui/it.json`) | `docs/plan/language-markets.md` §1, §5; `docs/plan/detail.md` (locale row 9) | none yet | 2026-11-19 | "Demenza neutral; marketing uses Alzheimer; giochi per anziani is the live phrase" (language-markets §1). |

### ar

| Language (code) | Public term for dementia | Term for Alzheimer's | Term people search with | Term to avoid | Site uses today | Source | Reviewer | Date | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ar | not in sources (the research names the public term only for Alzheimer's) | الزهايمر | ألعاب لمرضى الزهايمر; أنشطة لكبار السن; تطبيق الزهايمر | الخرف | رعاية الخرف (`sections.caregiving.label`, `site/src/i18n/ui/ar.json`) | `docs/plan/language-markets.md` §1, §5; `docs/plan/detail.md` (alternates) | none yet | 2026-11-19 | "الخرف is stigmatized; public copy uses الزهايمر. Right-to-left work required" (language-markets §1). |

### vi

| Language (code) | Public term for dementia | Term for Alzheimer's | Term people search with | Term to avoid | Site uses today | Source | Reviewer | Date | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| vi | not decided; sa sút trí tuệ is described as clinical | Alzheimer (families say it) | trò chơi cho người sa sút trí tuệ; hoạt động cho người bệnh Alzheimer; trò chơi cho người cao tuổi | not in sources | Chăm sóc (`sections.caregiving.label`, `site/src/i18n/ui/vi.json`) | `docs/plan/language-markets.md` §1, §5; `docs/plan/detail.md` (locale row 10); `docs/engineering/native-review.md` (Known points, Vietnamese) | none yet | 2026-11-19 | "Sa sút trí tuệ is clinical; families say Alzheimer or lẫn" (language-markets §1). native-review: the dementia word in titles "was chosen from the site's own search wording". |

### tr

| Language (code) | Public term for dementia | Term for Alzheimer's | Term people search with | Term to avoid | Site uses today | Source | Reviewer | Date | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tr | not decided; demans is not stigmatized | not in sources | not in sources | bunama | Bakım (`sections.caregiving.label`, `site/src/i18n/ui/tr.json`) | `docs/plan/language-markets.md` §1 | none yet | 2026-11-19 | "Turkish bunama is stigmatized, demans is not" (language-markets §1). |

### pl

| Language (code) | Public term for dementia | Term for Alzheimer's | Term people search with | Term to avoid | Site uses today | Source | Reviewer | Date | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| pl | not in sources (neutral; the research does not name the term) | not in sources | not in sources | not in sources | Opieka (`sections.caregiving.label`, `site/src/i18n/ui/pl.json`) | `docs/plan/language-markets.md` §1; `docs/plan/detail.md` (alternates) | none yet | 2026-11-19 | "Dutch and Polish terms neutral" (language-markets §1). |

### nl

| Language (code) | Public term for dementia | Term for Alzheimer's | Term people search with | Term to avoid | Site uses today | Source | Reviewer | Date | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| nl | not in sources (neutral; the research does not name the term) | not in sources | not in sources | not in sources | Mantelzorg (`sections.caregiving.label`, `site/src/i18n/ui/nl.json`) | `docs/plan/language-markets.md` §1; `docs/plan/detail.md` (alternates) | none yet | 2026-11-19 | "Dutch and Polish terms neutral" (language-markets §1). |

## Mismatches to review

The site string is at the key shown in `site/src/i18n/ui/<code>.json`. Guide
counts are the number of files in `site/src/content/guides-i18n/<code>/` whose
frontmatter `title` or `seoTitle` contains the term (a substring match).

### High: a term to avoid is in titles or headings

1. **fr**: `sections.caregiving.label` "Accompagner la démence"; `sections.caregiving.title` "Accompagner un proche vivant avec la démence"; `footer.dementiaActivities` "Activités pour les personnes vivant avec la démence"; `pages.handout.title` "Jeux gratuits et tout en douceur pour personnes atteintes de démence". Avoid: démence (language-markets §1). Guides: 70 of 114 fr files have démence in title or seoTitle, for example `fr/brain-health/diet.md`.
2. **ar**: `sections.caregiving.label` "رعاية الخرف"; `sections.caregiving.title` "رعاية شخص يعيش مع الخرف"; `footer.dementiaActivities` "أنشطة للأشخاص الذين يعيشون مع الخرف"; `pages.handout.title` "ألعاب مجانية وهادئة للأشخاص الذين يعيشون مع الخرف". Avoid: الخرف (language-markets §1). Guides: 74 of 80 ar files have الخرف in title or seoTitle, for example `ar/brain-health/diet.md`. Store keywords in `metadata/i18n/ar.json` also include الخرف (not a title).
3. **ko**: `sections.caregiving.label` "치매 돌봄"; `sections.caregiving.title` "치매가 있는 분 돌보기"; `footer.dementiaActivities` "치매가 있는 분을 위한 활동"; `pages.handout.title` "치매가 있는 분을 위한 무료 편안한 게임". Avoid in titles: 치매 (language-markets §1; detail.md row 8 "never in the title"). Guides: 79 of 80 ko files have 치매 in title or seoTitle. Outside the site: `metadata/i18n/ko.json` app_store.name and google_play.name "치매 어르신 게임: Creative Activities".

### Medium: wording differs from the recommended term or phrase

4. **zh-Hant**: 23 title or seoTitle lines in the guides use bare 失智 (for example `zh-Hant/caregiving/asking-to-go-home.md` title "失智長輩一直吵著要回家，該怎麼辦"), while 55 such lines use 失智症. Research names 失智症 for Taiwan. `pages.handout.title` "適合失智長輩的免費溫和遊戲" also uses the short form. Reviewer to decide whether the short form is acceptable in titles.
5. **de**: `footer.dementiaActivities` "Aktivitäten für Menschen mit Demenz"; `pages.handout.title` "Kostenlose, sanfte Spiele für Menschen mit Demenz". Research phrase is "Beschäftigung für Menschen mit Demenz" (language-markets §1; detail.md row 4). Wording differs (Aktivitäten vs Beschäftigung).
6. **es**: `pages.handout.title` "Juegos gratis y tranquilos para personas con demencia". Research says searchers type alzhéimer and the planned title is "Juegos para personas con alzhéimer" (detail.md row 2). The site title has no alzhéimer. This is a search-term gap, not a stigma issue.
7. **zh-Hans**: guide descriptions use 老年痴呆, the term the research calls stigmatizing: `site/src/content/guides-i18n/zh-Hans/activities/ideas.md` and `zh-Hans/activities/alzheimers.md` (description). The guide title `zh-Hans/caregiving/communication-tips.md` uses 痴呆症, which no source names; reviewer to check. The public term for Simplified is undecided in sources.

### Low: search-term gaps

8. **it**: `pages.handout.title` "Giochi semplici e gratuiti per persone con demenza". The research says "giochi per anziani" is the live search phrase (language-markets §1). Demenza itself is neutral, so this is not a stigma issue.
9. **pt-BR**: titles use demência, which is acceptable. Research says Alzheimer dominates search (language-markets §1), and the site titles do not use Alzheimer.

### Checked, no mismatch found

- ja: 認知症 is used in the UI and guides; no 痴呆 or ボケ found in `site/src/i18n/ui/` or guides.
- zh-Hans UI: no 老年痴呆 in `site/src/i18n/ui/zh-Hans.json`.
- tr: no bunama in UI or guides; the site uses demans.
- en: no "patients" in `site/src/i18n/ui/en.json`.
- vi: the title word is clinical, but native-review says it was chosen from the site's own search wording (native-review, Known points).
- nl, pl: no term the research names as avoid.

## Not decided by the sources

- The public term for dementia in zh-Hans, ko, ar, vi, tr, pl and nl. Cells are blank on purpose.
- Korean: 치매 is both the avoided title word and a term searchers type. The reviewer decides whether search keywords keep it.
- Arabic: the public term for dementia (as opposed to Alzheimer's) is not named.
- Alzheimer's term in ja, zh-Hant, de, ko, tr, pl and nl: not in sources.
- An empty "Term to avoid" cell means no source names one. It does not mean there is none.

## Source paths used

- `docs/specs/global/13-localization.md` (L10N-007 section and risks)
- `docs/plan/language-markets.md` (§1 candidate languages, §5 local search phrases, name implication)
- `docs/plan/detail.md` (locale table rows 1 to 10; alternates line)
- `docs/engineering/native-review.md` (Known points)
- `docs/strategy/keyword-research.csv` (English US worksheet only)
- `site/src/i18n/ui/<code>.json` for en, ja, zh-Hant, zh-Hans, de, es, fr, ko, pt-BR, it, ar, vi, tr, pl, nl (keys `sections.caregiving.label`, `sections.caregiving.title`, `footer.dementiaActivities`, `pages.handout.title`)
- `site/src/content/guides-i18n/<code>/**/*.md` (frontmatter `title` and `seoTitle` only, for the counts)
- `metadata/i18n/ko.json`, `metadata/i18n/ar.json` (store name and keywords, for the outside-the-site note)

## Open questions for the maintainer

- Which reviewer signs each language, in the order of [native review](../../engineering/native-review.md). Korean, French and Arabic carry the most mismatches.
- Whether mismatches 1 to 3 should be fixed before a reviewer is named. The glossary does not change the site.
