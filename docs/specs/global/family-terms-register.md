# Family terms register (L10N-015)

Status: **Draft, unreviewed.** This register records what the English source
says about family structure and forms of address. It changes no copy, and it
decides no form of address. The reviewer chooses forms per locale.

The rule behind it is in [L10N-015 in the localization spec](13-localization.md):
role words that fit many families ("the older person", "your family member",
"the person you care for"), no copy that assumes one kind of family, and no
term that labels the older person as a patient. The register follows
[AGENTS.md](../../../AGENTS.md).

## How to use this register

- **Count** is the number of matching lines, not occurrences. A match is a
  whole word, case-insensitive. The scope is listed under "Scope" below.
- **Legitimate use** means a page that is really about grandparents or older
  parents, a search-term title or keyword, a source title or link, a holiday name,
  a service name, or a question a searcher would type in their own voice. These
  are kept and marked "depends" or "no".
- **Assumption** means example copy that presumes a particular family, such as
  "Look at Grandpa's hat" or "Hi Dad, it's Sarah, your daughter". These need a
  role word or a name.
- **Must-fix** means any use of "patient" or "sufferer" for the older person.
  None was found; see the section below the table.
- **Proposed role word** is a proposal. The reviewer and the maintainer decide.

## Scope

Searched, in English only: `site/src/content/guides/`,
`site/src/content/activity-cards/`, `site/src/content/hubs/`, `site/src/pages/`,
`site/src/i18n/ui/en.json`, `lib/l10n/arb/app_en.arb`,
`assets/data/i18n/packs_en.json`, `metadata/app-store.en-US.json`,
`metadata/en-US/` and `metadata/google-play.en-US.json`.

Not searched: `guides-i18n/` (translations, covered by the other register) and
the game and play folders under `site/src/i18n/`, which have no separate English
file. Store keywords and titles are included because they are search terms.

## Term audit

| Term | Count | Example locations | Assumes one family shape? | Proposed role word | Notes |
| --- | --- | --- | --- | --- | --- |
| grandparent / grandparents | 84 / 21 | `site/src/content/hubs/grandparent-grandchild-activities.md:17`; `site/src/pages/grandparent-grandchild-activities.astro`; `site/src/content/guides/together/grandparent-and-grandchild-crafts.md:2` | Depends | "the older person", or "your family member" where the page is not about grandparents | Legitimate on the grandparent and grandchild pages, which are about that relationship. Elsewhere, the body copy should not assume a grandparent. `together/activities-with-older-parents.md:2` is a title about a specific relationship and is legitimate. |
| grandchild / grandchildren | 38 / 13 | `site/src/content/guides/together/staying-connected-from-afar.md:19`; `site/src/content/guides/together/grandparent-and-grandchild-crafts.md:2` | Depends | "your family member" | Legitimate on the grandparent and grandchild pages. Many hits are `related:` link lists, which are URL slugs and not copy. |
| grandma | 6 | `site/src/content/hubs/grandparent-grandchild-activities.md:17`, `:18`; `lib/l10n/arb/app_en.arb:150` | Yes (examples) | "the older person" | The hub's example answers assume a grandmother. The app file has an example value at `app_en.arb:150`, "Grandma in the garden". A neutral example would fit every family. |
| grandpa | 5 | `site/src/content/guides/together/staying-connected-from-afar.md:44`; `site/src/content/guides/activities/phone-and-video-calls.md:68`; `site/src/content/guides/caregiving/talking-to-children-about-dementia.md:67` | Yes (examples) | "the older person", or the person's name | "Look at Grandpa's hat" assumes a grandfather. A version such as "Look at the hat in this photo" works for every family. |
| grandmother | 1 | `site/src/content/guides/caregiving/how-to-play-together.md:136` ("My grandmother had a dog like this.") | Yes (example) | "your family member" | An example of something a family member might say. Keep if it is the reader's own voice. |
| grandfather / mum / father / husband / wife | 0 | — | — | — | None found in the English scope. |
| mom | 9 | `site/src/content/guides/caregiving/asking-to-go-home.md:23`; `site/src/content/guides/caregiving/communication-tips.md:105`; `lib/l10n/arb/app_en.arb:1699` | Depends | "the person you care for" | Questions written in the reader's voice are legitimate. `app_en.arb:1699` ("Hi Mom, it's Susan, your daughter.") assumes a mother and a daughter in the visit tip. |
| dad | 11 | `site/src/content/guides/caregiving/repeated-questions.md:23`; `site/src/content/guides/caregiving/communication-tips.md:62`; `site/src/content/guides/caregiving/family-disagreements-about-dementia-care.md:52` | Depends | "the person you care for" | Reader-voice questions are legitimate. "Hi Dad, it's Sarah, your daughter." is an example script that assumes a father and a daughter. |
| mother | 4 | `site/src/content/guides/activities/trivia.md:105` ("Mother's Day"); `site/src/content/guides/activities/coloring.md:25`; `site/src/content/hubs/bedside-activities.md:17` | Depends | "the person you care for" | "Mother's Day" is a holiday name and is legitimate. The other two are reader-voice questions. |
| parent | 21 | `site/src/content/guides/together/activities-with-older-parents.md:2` (title); `site/src/content/guides/together/staying-connected-from-afar.md:4`; `site/src/content/guides/activities/finish-the-saying.md:73` | Depends | "the older person" in body copy; keep in titles where they are search wording | Pages for adult children with an older parent are legitimate for that audience. `finish-the-saying.md:73` ("their parent or spouse always said") assumes both exist. |
| parents | 24 | `site/src/content/guides/together/activities-with-older-parents.md:3` (SEO title); `site/src/content/guides/together/activities-with-older-parents.md:4` (description) | Depends | same as "parent" | Many hits are `related:` slugs such as `activities-with-older-parents`. These are links, not copy. |
| spouse | 5 | `site/src/content/guides/brain-health/social-connection.md:79`; `site/src/content/guides/brain-health/warning-signs.md:102`; `site/src/content/guides/activities/phone-and-video-calls.md:140` | Depends | — | Legitimate in a list of losses, and in an inclusive list of helpers ("spouse, aide, sibling or staff member"). |
| son | 1 | `site/src/content/guides/activities/visiting.md:98` ("Hi Dad, it's Mark, your son.") | Yes (example) | "the person you care for", or the visitor's name | An example script. Pair with the daughter rows. |
| daughter | 7 | `site/src/content/guides/together/staying-connected-from-afar.md:56`; `site/src/content/guides/activities/visiting.md:15`; `lib/l10n/arb/app_en.arb:1699` | Yes (examples) | "your family member", or the visitor's name | Example scripts assume an adult child visits a parent. `site/src/content/hubs/occasions/gift.md:38` ("a sachet for a daughter") is a gift example and depends on context. |
| patient | 5 | `site/src/content/guides/brain-health/hearing.md:130`; `site/src/content/guides/activities/conversation-games.md:54`; `site/src/content/guides/activities/visiting.md:101`; `site/src/content/guides/caregiving/communication-tips.md:49`; `site/src/content/guides/caregiving/asking-to-go-home.md:66` | No | — | All five are the adjective ("be patient", "a calm, patient tone") or a URL slug in a source link. None labels the older person. Not a must-fix. |
| patients | 2 | `site/src/content/guides/brain-health/warning-signs.md:41` (source title "Assessing Cognitive Impairment in Older Patients"); `site/src/content/guides/brain-health/warning-signs.md:43` (URL of that source) | No | — | A clinical source title. It names the source and is not a label for the reader. The reviewer may keep it. It should not appear in body copy. |
| sufferer / sufferers | 0 | — | — | — | None found. |
| loved one | 2 | `site/src/content/guides/brain-health/social-connection.md:81`; `site/src/content/guides/brain-health/social-connection.md:117` | Depends | "the person you care for", in care contexts | "Caring for a loved one who is unwell" is a risk factor for the carer, which is a legitimate use. |
| loved ones | 1 | `site/src/content/guides/caregiving/choosing-residential-dementia-care.md:71` | Depends | — | Part of a list of care values. No change suggested. |
| elderly | 3 | `site/src/content/guides/brain-health/can-dementia-be-prevented.md:48` (study title, "at-risk elderly people"); `metadata/app-store.en-US.json:7` (keyword); `metadata/en-US/keywords.txt:1` (keyword) | Depends | — | Source titles and store search keywords. None of the three is body copy about the older person. |
| senior | 8 | `site/src/content/guides/brain-health/social-connection.md:96` ("Senior centers", a service name); `site/src/content/guides/activities/pen-pals-for-older-adults.md:3` (SEO title); `site/src/content/guides/activities/ideas.md:212` ("Visit a senior center") | Depends | "the older person" in body copy; service names stay | Service and place names are legitimate. The SEO title is search wording. |
| seniors | 45 | `site/src/content/guides/caregiving/choosing-apps-and-games.md:62` (games "labeled for seniors"); `site/src/content/guides/activities/conversation-games.md:28` (a reader's question); `site/src/content/guides/activities/group-art-activities.md:3` (SEO title, "Adults and Seniors") | Depends | "older adults" or "the older person" in body copy | Most hits are SEO titles, store keywords and questions a searcher types. Whether titles keep "seniors" is a maintainer decision. This register does not decide it. |

## Must-fix check

- Uses of "patient" or "sufferer" for the older person: **none found** in the
  English scope. The five "patient" lines are the adjective or a URL slug, and the
  two "patients" lines are a clinical source title and its URL.
- Uses of "sufferer": none.

## Forms of address per locale

<!-- cspell:disable -->

The reviewer chooses each form. The counts below are rough word-match counts
from the repository. They show what is present, not a tally of the
translation, and they are not a decision.

| Language | Formal form observed | Informal form observed | Where (file) | Current choice in the repository | Reviewer to choose |
| --- | --- | --- | --- | --- | --- |
| German (de) | "Sie" in instructions: `lib/l10n/arb/app_de.arb:361`, `:365`, `:385`; the guides use "Sie" (`site/src/content/guides-i18n/de/activities/ideas.md:12-18`) | "du" and "deine" in lines a family member says: `lib/l10n/arb/app_de.arb:361` ("hier bist du sicher"), `:365` ("Das hast du schon gefragt"), `:385` ("deine Tochter") | `lib/l10n/arb/app_de.arb`; `site/src/content/guides-i18n/de/` | Mixed: Sie for instructions, du in quoted family lines. Roughly 57 "du" or "dein" word matches against many more formal forms across the guides. | Yes. One form for lines a family member says, as the native review notes. |
| Spanish (es) | "usted" in the guides (about 314 word matches) and `lib/l10n/arb/app_es.arb` (11 lines) | No informal "tú" found in `app_es.arb`. About 17 "tu" word matches in the guides, which may be possessives. | `site/src/content/guides-i18n/es/`; `lib/l10n/arb/app_es.arb` | Formal (usted) | Yes. |
| French (fr) | "vous" in the guides (about 1,773 word matches) and `lib/l10n/arb/app_fr.arb` (51 lines) | "tu", "ton", "ta" in the guides (about 69, including possessives); `app_fr.arb` has one "tu" line | `site/src/content/guides-i18n/fr/`; `lib/l10n/arb/app_fr.arb` | Formal (vous) | Yes. |
| Italian (it) | "Lei" in the guides (about 129 word matches) and `lib/l10n/arb/app_it.arb` (4 lines) | "tu" in the guides (about 10 word matches); none in `app_it.arb` | `site/src/content/guides-i18n/it/`; `lib/l10n/arb/app_it.arb` | Formal (Lei) | Yes. |
| Ukrainian (uk) | Formal "ви" and informal "ти" both present in `site/src/content/guides-i18n/uk/` and `lib/l10n/arb/app_uk.arb`. Word-boundary counts are not reliable for Cyrillic, so no count is given. | Same as left | `site/src/content/guides-i18n/uk/`; `lib/l10n/arb/app_uk.arb` | Not determined by this pass | Yes. |
| Russian (ru) | Formal "вы" and informal "ты" both present in `site/src/content/guides-i18n/ru/`. Substring matches make the counts unreliable. | Same as left | `site/src/content/guides-i18n/ru/`; `lib/l10n/arb/app_ru.arb` | Not determined by this pass | Yes. |
| Arabic (ar) | None. Second person is masculine singular ("أنت") in 48 of 80 guide files and 4 lines of `lib/l10n/arb/app_ar.arb`. No feminine form ("أنتِ") was found. | None | `site/src/content/guides-i18n/ar/`; `lib/l10n/arb/app_ar.arb` | Masculine singular throughout | Yes. The native review asks for the form to be chosen. |

Languages not checked in this pass: all other codes in `docs/languages.csv`
(including Japanese, Korean, Vietnamese, Thai, Polish, Dutch, Turkish,
Indonesian and Hindi). Their forms of address are not recorded here. Each needs
a reviewer's choice before the family copy is final.

<!-- cspell:enable -->

## Notes

- The reviewer should look at the German row first. The native review guide
  already flags it, and the German app file uses both "Sie" and "du" in the
  same set of today-tips.
- No decision has been recorded. The "Decided by" and "Date" fields do not
  exist in this register because no row has a decision. Record a decision only
  after a named reviewer signs off.
