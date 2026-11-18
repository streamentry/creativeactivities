# Cultural adaptation register (L10N-012)

Status: **Draft, unreviewed.** Nothing in this register is decided. Every row
waits for a named native reviewer at locale sign-off.

Source of the rows: the "Known points for reviewers" list in
[native review guide](../../engineering/native-review.md). Its 11 bullets hold
20 points, and each point has one row below. The row marked "uk (extra)" is an
extra point found while locating files. Locations were found by searching the repository, and the
English counterpart of each file is named where one exists. The register is
tied to [L10N-012 in the localization spec](13-localization.md), and it follows
the rules in [AGENTS.md](../../../AGENTS.md).

## How to use this register

- Add one row for every swap or known point. A swap is any change made from the
  English source to an example, food, holiday, saying, picture, quiz answer or
  music choice for one locale.
- Only a named native reviewer decides keep, change or remove, at locale
  sign-off. The "Proposed decision" column is a proposal from this draft. It is
  not a decision, and it is not a reviewer's sign-off.
- A swap never removes a safety flag. That includes poison warnings, emergency
  numbers, local pointers and allergen or swallowing notes.
- Do not replace a US example with a stereotype of another culture.
- "Decided by" and "Date" stay "—" until the reviewer signs the row.
- When a row is decided, record the reviewer and date here and update the copy
  in the same change. Do not change the copy alone.

## Register

<!-- cspell:disable -->

| Locale | Where (file path, line) | English source | Current text or issue | Proposed decision (proposal only) | Why | Decided by | Date |
| --- | --- | --- | --- | --- | --- | --- | --- |
| es | `site/src/content/guides-i18n/es/activities/trivia.md:74`; `assets/data/i18n/packs_es.json:128` | `site/src/content/guides/activities/trivia.md`; `assets/data/i18n/packs_en.json` | Trivia asks about a "cantante y actor mexicano"; the picture pack has "Taco mexicano". Examples lean Mexican. | Keep (proposal). Reviewer checks that the examples suit US Spanish speakers too. | Native review asks whether the examples suit US Spanish speakers. | — | — |
| vi | `site/src/content/guides-i18n/vi/activities/music.md:69` | `site/src/content/guides/activities/music.md` (genre list) | The genre list includes "nhạc cách mạng" (revolution-era music) next to other genres. | Reviewer to choose keep or remove. No proposal drafted. | Native review asks whether to keep it for readers abroad. | — | — |
| vi | `site/src/content/guides-i18n/vi/activities/ideas.md:2`; `metadata/i18n/vi.json:14` (keywords) | `site/src/content/guides/activities/ideas.md` | The title and keywords use "sa sút trí tuệ" (dementia), taken from the site's own search wording. | Keep (proposal), so the title matches what families search for. | Native review records the source of the word. Reviewer checks that it is not clinical or harsh. | — | — |
| ja | `site/src/content/guides-i18n/ja/activities/for-men.md:50`, `:67`, `:73` | `site/src/content/guides/activities/for-men.md` | A question and a table row cover uniformed work (for example the Self-Defense Forces) and memories of military service. | Change (proposal): keep the neutral work question. Reviewer decides whether the military and uniformed examples stay. | Native review calls this a sensitive area. Line 73 says military memories can bring up strong feelings. | — | — |
| ja | `site/src/content/guides-i18n/ja/activities/outdoor-and-gardening.md:14`, `:97` | `site/src/content/guides/activities/outdoor-and-gardening.md` | Poison wording: "毒のあるもの" (poisonous things). Line 97 points to a poison information centre (中毒情報センター). Needs a native check. | Keep the safety content. Change wording only after a native check and a check that the centre pointer is current. | This is safety information. A swap must keep the warning and the local pointer. | — | — |
| zh-Hant | `site/src/content/guides-i18n/zh-Hant/brain-health/social-connection.md` and 7 other guide files that use 台灣 | English guides under `site/src/content/guides/`; `metadata/i18n/zh-Hant.json` | Taiwan wording is used. No 香港 (Hong Kong) text was found, so there is no separate Hong Kong listing. | Keep (proposal). A Hong Kong variant is a market decision for the maintainer, not a swap. | Native review records that the Hong Kong listing is not separate. | — | — |
| zh-Hant | `site/src/content/guides-i18n/zh-Hant/activities/music.md:58` | `site/src/content/guides/activities/music.md` (faith and culture bullet) | The religious music list includes "佛曲" (Buddhist chants). | Keep (proposal) as one listed choice. No religious symbol is used by default (L10N-013). | Religious music is a category a reader may choose. The item is music, not an image or symbol. | — | — |
| zh-Hans | `metadata/i18n/zh-Hans.json:14` (keywords use 失智症); `site/src/content/guides-i18n/zh-Hans/activities/ideas.md:4` (description) | `metadata/app-store.en-US.json` (dementia keyword) | The formal term 失智 appears in 26 lines across the zh-Hans guides, and the older everyday term 痴呆 in 9 lines. The guide description writes the older term in brackets after 认知症. | Keep the formal term (proposal). Reviewer decides whether the bracketed older term in `ideas.md:4` stays. | Native review says the older term may stigmatize. Choosing the formal term may cost some search traffic. | — | — |
| zh-Hans | `site/src/content/guides-i18n/zh-Hans/caregiving/tablets-and-screens.md:10` | `site/src/content/guides/caregiving/tablets-and-screens.md` | Names of Android settings menus are written out, and menu names vary by phone maker. | Change only after a reviewer checks each name on a phone set to that language. | A wrong menu name sends a family to the wrong place. | — | — |
| de | `lib/l10n/arb/app_de.arb:361`, `:365`, `:370`, `:385` | `lib/l10n/arb/app_en.arb` (same keys; `todayVisitTry1` at line 1699); `site/src/content/guides/activities/ideas.md` | Instructions use the formal "Sie". Lines a family member says to the older person use informal "du" or "deine", for example "Hallo Mama, hier ist Anna, deine Tochter." The guides use "Sie" (`site/src/content/guides-i18n/de/activities/ideas.md:12-18`). | Change (proposal): one form for lines a family member says. The reviewer chooses Sie or du and applies it to every quoted line. | L10N-015 asks that lines spoken by a family member use one form throughout. | — | — |
| fr | `site/src/content/guides-i18n/fr/brain-health/exercise.md:18`, `:24`; `site/src/content/guides-i18n/fr/brain-health/social-connection.md:23` | `site/src/content/guides/brain-health/exercise.md`; `site/src/content/guides/brain-health/social-connection.md` | Evidence hedges: the exercise trial "n'a pas montré de différence nette", and "Cela n'a pas été prouvé" on social connection. | Keep if the strength matches the English hedge. Reviewer compares each line with the English. | Native review asks for the strength to be read. Every hedge in the English must remain a hedge. | — | — |
| fr | `site/src/content/guides-i18n/fr/activities/arts-and-crafts.md:30`, `:61` ("courtepointe"); `site/src/content/guides-i18n/fr/activities/ideas.md:143` and `alzheimers.md:83` ("patchwork") | `site/src/content/guides/activities/arts-and-crafts.md` | Quilting is named in two ways. "Courtepointe" leans Canadian. | Change (proposal): one term across the guides. Reviewer chooses which. | Native review notes the Canadian lean of one quilting word. | — | — |
| it | `assets/data/i18n/packs_it.json:116` (`packs.flowers_tropical.images.chrysanthemum_6`: "Crisantemo") | `assets/data/i18n/packs_en.json:116` ("Chrysanthemum") | The caption is a flower associated with funerals in Italy. | Change (proposal): replace the caption and the picture with a flower not linked to funerals. | Native review. The picture's rights and consent must be logged ([L10N-027](13-localization.md)). | — | — |
| ar | `lib/l10n/arb/app_ar.arb` (whole file); `site/src/i18n/ui/ar.json` | `lib/l10n/arb/app_en.arb`; `site/src/i18n/ui/en.json` | Not a text swap. The right-to-left layout must be checked in the running app, including text at 200% and the taller Arabic line height. The layout is not in one text file. | Check only. No swap. | Native review asks for a layout check. | — | — |
| ar | `site/src/i18n/ui/ar.json:289` ("العب «{name}» ←") | `site/src/i18n/ui/en.json` (play link label) | The arrow at the end of a link label points left. | Keep until a reviewer checks the arrow in the rendered page. Change only if it reads wrong. | Native review asks that arrow direction follow the reading direction. | — | — |
| ar | `lib/l10n/arb/app_ar.arb` (4 lines use أنت; none uses أنتِ); `site/src/content/guides-i18n/ar/` (48 of 80 files use أنت; none uses أنتِ) | `lib/l10n/arb/app_en.arb` | The address is masculine singular throughout. | Reviewer to choose the form. No proposal drafted. | Native review notes that masculine singular is used throughout. | — | — |
| th | `lib/l10n/arb/app_th.arb:187` (`helpRateBody` uses "คะแนน") | `lib/l10n/arb/app_en.arb` (`helpRateBody`) | The rating wording uses a word that also means "score". The store rating label itself was not located. | Change (proposal): wording that means stars, if the reviewer confirms the Thai word. | Native review asks for a word that means stars. | — | — |
| th | `site/src/content/guides-i18n/th/caregiving/how-to-play-together.md:119`; `site/src/content/guides-i18n/th/brain-health/brain-games.md:136` | `site/src/content/guides/caregiving/how-to-play-together.md` | The guides name the English word search ("ค้นหาคำ (ภาษาอังกฤษ)") because there is no Thai word search. | Keep (proposal). Reviewer confirms the note. | Native review: there is no Thai word search, so the guides say so. | — | — |
| ru | `site/src/content/guides-i18n/ru/activities/music.md:115` | `site/src/content/guides/activities/music.md:113` | Sad songs are linked to war, grief or loss. This is advice, not a political example. | Keep (proposal). Reviewer checks the rest of the guides for war and political examples. | Native review: avoid war and political examples. This scan covered only the listed words. | — | — |
| uk | `site/src/content/guides-i18n/uk/` (all guides); `assets/data/i18n/packs_uk.json` | English counterparts in `site/src/content/guides/` and `assets/data/i18n/packs_en.json` | The text was written from English, not from Russian. The repository does not record the source language; all uk files arrived in import commit `7c0be75f`. | Not located as a record. No swap proposed. Reviewer compares with the English. | Native review records that the Ukrainian text came from English. | — | — |
| uk (extra) | `site/src/content/guides-i18n/uk/activities/for-men.md:54`, `:77` | `site/src/content/guides/activities/for-men.md` | Military service and military work appear in the men's guide. This point is not in native-review.md. | Reviewer to choose, together with the Japanese men's guide row, so the two are decided the same way. | Same kind of sensitive area as the Japanese men's guide row. Found while locating files. | — | — |

<!-- cspell:enable -->

## Points not located

- **Arabic right-to-left layout (the first Arabic row).** The check is
  run-time. No single text file holds the layout behaviour, so the row points to
  the translation files only.
- **Ukrainian source language (the uk row).** The repository has no record of
  the translation source. The row cannot be confirmed from the repository.
- **Thai store rating label (the first Thai row).** The wording was found in
  `helpRateBody`. The store label key was not located.

Every other point in the native review list was located with a path.
