# Data and tracker inventory

Items: [TSA-011](14-trust-safety-accessibility-privacy.md) (data and tracker inventory) and [TSA-042](14-trust-safety-accessibility-privacy.md) (third-party scripts, fonts and integrity).

Checked: 2026-11-15, on branch `s2h/h3-privacy-security` from `888b4cf`. Code paths are relative to the repository root.

**Status: draft for maintainer sign-off.** The maintainer has not yet signed this inventory off (TSA-011 acceptance). Nothing here was changed to match this list: where the code and the goals disagree, the disagreement is listed in section 6.

**It is enforced.** `site/src/lib/data-inventory.test.ts` scans the website and the app. It fails when code writes a storage key, sets a cookie, sends an analytics event or names an outside origin that is not written in this file. To add one, add a row here in the same change.

Terms used below: *local storage* is the browser's `localStorage`. *SharedPreferences* is the app's key-value store on the device. "Sent off the device" means data leaves the reader's device for a server the site or app does not run itself.

---

## 1. Website: what the browser keeps

These are written by the site's own code. None is sent to Creative Activities. Each is removed by the reader on the [Your data on this device](/your-data/) page, or by clearing site data in the browser.

| Name | Kind | Written by | What it holds | Sent off the device? | Kept until |
|---|---|---|---|---|---|
| `ca-saved-activities-v1` | local storage | `site/src/lib/saved-activities.ts` (activity page, Save) | Short names of activities saved for later, up to 60 | No | The reader removes them or clears site data |
| `ca-collections-v1` | local storage | `site/src/lib/saved-collections.ts` (activity page, Collections, WEB-028) | Named collections of saved activities, up to 20 collections of 60 activities each: each collection's name and the short names of its activities, plus a format version. Names can contain personal information; the page warns about this | No. Downloaded files, made on the device, hold the same names and short names and are not sent anywhere | The reader removes them or clears site data |
| `ca-paths-v1` | local storage | `site/src/lib/paths.ts` (the four-week path pages) | For each path, the week a person chose to start at and the weeks they skipped, as week numbers (stored as 0 to 3) | No | The reader forgets a path's place on its page or removes it on `/your-data/`, or clears site data |
| `ca-what-i-have-v1` | local storage | `site/src/lib/what-i-have.ts` (What I have page) | Short names of the everyday items ticked on the What I have page, from a fixed list | No | The reader clears the list on the page or removes it on `/your-data/`, or clears site data |
| `ca-tried-activities-v1` | local storage | `site/src/lib/activity-feedback.ts` (activity page, "We tried this") | Short names of activities marked as tried, up to 200 | The first mark for each activity sends `activity_started_confirmed` (section 3) | As above |
| `ca-made-notes-v1` | local storage | `site/src/lib/made-list.ts` (My made list page, `/made/`, COM-024) | An optional short note the reader wrote for each activity on My made list, up to 280 characters of plain text each, up to 200 notes, keyed by activity short name. The list of tried activities is `ca-tried-activities-v1` | No | As above; the reader clears a note by emptying it, or removes all notes on `/your-data/` |
| `ca-analytics-consent-v1` | local storage | `site/src/lib/consent.ts`, set by `ConsentBar.astro` and the privacy page choice | `granted` or `denied`; absent until the visitor answers | No. It decides whether Google Tag Manager loads at all | As above; deleting it on `/your-data/` makes the site ask again |
| `gm-today-notes-v1` | local storage | `site/src/lib/today/notes.ts` (Today page) | The reader's own notes, up to 280 characters each, with the day, outcome and time of day | No | As above |
| `gm-text-size` | local storage | `site/src/components/TextSize.astro` | `standard` or `large` | No | As above |
| `gm-contrast` | local storage | `site/src/components/TextSize.astro` | `standard` or `high` | No | As above |
| `ca-plain-steps` | local storage | `site/src/components/PlainToggle.tsx` (activity page, Short steps) | `1` or `0`: whether activity cards show short steps | No | As above |
| `gm-theme` | local storage | `site/src/lib/display-settings.ts` (`THEME_KEY`), set by `site/src/components/TextSize.astro` | `light` or `dark`; absent means the device setting | No | As above |
| `gm-line-length` | local storage | `site/src/lib/display-settings.ts` (`LINE_LENGTH_KEY`), set by `site/src/components/TextSize.astro` | `short`; absent means standard lines | No | As above |
| `gm-spacing` | local storage | `site/src/lib/display-settings.ts` (`SPACING_KEY`), set by `site/src/components/TextSize.astro` | `more`; absent means standard spacing | No | As above |
| `gm-play-settings` | local storage | `site/src/games/shared/settings.ts` | Game sound on or off | No | As above |
| `gm-place-v1-` plus the game's short name (one key per game, not the photo games) | local storage | `site/src/games/shared/place.ts`, written when a person rests in a game (`GameFrame.tsx`), removed by Start again or Start fresh | The game's own board as JSON, in an envelope with version 1; no timestamps, scores or photos. Absent until the person rests in that game | No | As above |
| `gm_lang` | cookie, one year, `SameSite=Lax`, path `/` | `site/src/components/LanguageChoice.astro` through `site/src/lib/language-choice.ts`, and expired by `site/src/pages/your-data.astro` | The language code the reader chose | Sent to the site's host with each page request, as every cookie is | One year, or until removed |

Not used by the site: `sessionStorage`, IndexedDB, Cache Storage, service workers, and any other cookie. Only two files write a cookie (`LanguageChoice.astro` and `your-data.astro`); the test checks this.

### Cookies set by Google's tag (not written by site code)

Google Tag Manager, which loads from `Analytics.astro` (section 4) **only after the visitor chooses "Allow"** (consent first, maintainer decision 2026-11-15), can set its own cookies, for example `_ga` and `_ga_` followed by the container or stream ID, and `_gcl_au` for ads conversion linking. The names come from Google's public documentation. **They have not been confirmed in a live browser session.** Check them in a clean browser profile before sign-off. Whether these cookies are set at all depends on the GTM and GA4 settings, which live in the Google console and are not in this repository.

---

## 2. App: what the device keeps

Source: `lib/`. All of this stays on the device, in the app's own storage. The app has no account, no server and no analytics library (`pubspec.yaml`; see the note in `site/src/pages/app-privacy.astro` on earlier versions).

### 2a. SharedPreferences keys

| Key | Feature (file under `lib/`) | What it holds |
|---|---|---|
| `app.language.v1` | `l10n/app_language.dart` | The app language tag, when the reader chose one |
| `gm.library.packPreferences` | `features/home/data/pack_preferences.dart` | Which picture packs are shown |
| `gm.library.interests` | `features/home/data/interest_preferences.dart` | Topics the reader picked |
| `todays_activity.day` | `features/todays_activity/data/todays_activity.dart` | The day of the activity offered on the home screen |
| `todays_activity.id` | `features/todays_activity/data/todays_activity.dart` | The activity offered that day |
| `today_notes_v1` | `features/today/data/today_notes.dart` | The reader's Today notes |
| `gm.gentle.session.` (prefix, one key per session) | `features/gentle_activities/data/gentle_session.dart` | Progress in one gentle activity session |
| `gm.gentle.preferences` | `features/gentle_activities/data/gentle_preferences.dart` | Gentle activity preferences |
| `reminder_enabled`, `reminder_weekdays`, `reminder_hour`, `reminder_minute` | `features/reminders/data/reminder_settings.dart` | Optional reminder time and days, if the reader set one |
| `wellbeing.momentDays.v1` | `features/wellbeing/data/moment_history.dart` | Days on which the reader recorded a moment |
| `review_finished_games`, `review_play_days`, `review_last_play_day`, `review_finished_since_home`, `review_last_asked_ms` | `shared/rating/review_request.dart` | Counts used to decide when to ask for a store review; no identifier is sent |
| `share_completed_games`, `share_has_shared`, `share_declines`, `share_last_asked_ms` | `shared/sharing/share_invitation.dart` | Counts used to decide when to offer sharing |
| `Music_Key`, `Sound_Key` | `data/models/sound_setting.dart` | Music and sound on or off |

### 2b. Files on the device

| Location | Feature | What it holds | Notes |
|---|---|---|---|
| Application support folder, `family_photos_v1/` | `features/gentle_activities/data/family_photo_store.dart`, `photo_importer.dart`, `photo_annotations.dart` | Working copies of photos the reader adds (up to 24), a manifest, optional captions | Originals stay in the reader's photo library. Removal steps: [privacy choices](/privacy-choices/). Damaged manifests are set aside as `collection.damaged-*.json`. |

---

## 3. Analytics events (website)

Source: `EVENT_DICTIONARY` in `site/src/lib/track.ts`, the only place events are sent. An event is dropped unless every property matches its rule. No event carries free text, a health detail or a name.

| Event | Properties | Sent when |
|---|---|---|
| `activity_start` | none | A game or activity is started |
| `activity_restart` | none | A game is restarted |
| `activity_done` | none | A game is finished |
| `activity_print` | none | A printable sheet is printed |
| `activity_feedback` | `answer` (`yes` or `not_really`) | The reader answers "Did you enjoy this?" in a game |
| `activity_started_confirmed` | `activity` (short name) | The reader first marks "We tried this" for an activity |
| `activity_not_a_fit` | `activity`, `reason` (fixed list) | The reader answers "This didn't fit", with a fixed reason |
| `activity_view` | `activity` | An activity page loads, once per page load |
| `activity_save` | `activity` | The reader turns on "Save for later" |
| `activity_share` | `activity` | The reader uses the Share button on an activity page |
| `app_cta_click` | `store` (`app_store` or `google_play`), `placement` (fixed list) | An app store badge is clicked |

These events are sent through `dataLayer` to Google Tag Manager, and from there to Google Analytics 4 if the container is set up that way. The GA4 setup is in the Google console and is not in this repository (section 6).

Photo pairs (`/games/photo-pairs/`) and Scrapbook (`/games/scrapbook/`), the two pages built to open family photos, load no analytics at all, and `track()` does nothing there. Picture puzzle (`/games/picture-puzzle/`), which accepts a family photo too, and the kids guides under `/kids/` (every language, and the section page) load no analytics either (maintainer decisions GAME-058 and CNT-880, 2026-11-21).

---

## 4. Third-party requests and outside origins

### 4a. Requests made by a page

| Origin | Used for | Where it loads | Integrity |
|---|---|---|---|
| `https://www.googletagmanager.com` | Google Tag Manager loader (`gtm.js`) for container `GTM-5ZSV72WC` | Every page except `/games/photo-pairs/`, `/games/picture-puzzle/` and `/games/scrapbook/` (with their translations where they exist) and `/kids/` (every language), and only after the visitor chooses "Allow" (`Analytics.astro`, `lib/consent-runtime.ts`); consent mode starts all denied and ad storage stays denied; Tag Manager's automatic listeners and Custom HTML are blocklisted (`lib/consent.ts`) | No SRI. Google changes `gtm.js` for each container, so no fixed hash exists. Documented as an exception in `data-inventory.test.ts`. |
| `https://*.googletagmanager.com`, `https://*.google-analytics.com`, `https://*.analytics.google.com` | Measurement requests and the image beacon, set by Google's tag | Pages with the tag. Allowed in `connect-src` and `img-src` in `public/_headers` | Not applicable (data requests) |

### 4b. Fonts and images

- Fonts are self-hosted under `/fonts/` (Atkinson Hyperlegible Next and subsets of Noto and Roboto). No page loads a font from Google Fonts or another host. The test checks the source for `fonts.googleapis.com` and `fonts.gstatic.com`.
- Pictures and other images are served from the site (`/pictures/`, `/og/`).

### 4c. Outside links (opened by the reader, not loaded by the page)

| Origin | Why the site links to it |
|---|---|
| `https://apps.apple.com` | App Store listing and store badge (`site/src/lib/site.ts`, app share) |
| `https://play.google.com` | Google Play listing and store badge (`site/src/lib/site.ts`, app share) |
| `https://creativeactivities.org` | The site's own address, used in app links and share text (`lib/shared/utils/`) |
| `https://reportaproblem.apple.com` | Apple's purchase support, linked from the terms and support pages |
| `https://www.apple.com` | Apple's end-user license terms, linked from the terms page |
| `https://policies.google.com`, `https://tools.google.com` | Google's privacy and ads-settings pages, linked from the privacy notice |
| `https://www.cloudflare.com` | Host information, linked from the privacy notice |
| `https://github.com` | The public event dictionary (`docs/specs/global/events.md`), linked from the privacy notice |
| `https://arttherapy.org` | American Art Therapy Association credentials page, cited as a source and linked from the art-therapy guides (`finding-an-art-therapist`, `group-art-activities`) |
| `https://atcb.org` | Art Therapy Credentials Board register, linked from `/art-therapy-and-creative-activities/` so readers can check a US credential |
| `https://www.baat.org` | British Association of Art Therapists, linked from the same page |
| `https://www.hcpc-uk.org` | Health and Care Professions Council register (UK protected titles), linked from the same page |

### 4d. Namespace identifiers (not requested)

| Origin | Where it appears |
|---|---|
| `https://schema.org` | JSON-LD structured data type (`JsonLd.astro`) |
| `http://www.w3.org` | SVG and XML namespace attributes |
| `http://www.sitemaps.org` | Sitemap XML namespace |

### 4e. Build and maintenance scripts (not visitor-facing)

| Origin | Script |
|---|---|
| `https://api.indexnow.org` | `site/scripts/indexnow.mjs` submits URLs after a release |

---

## 5. Third parties on child-reachable and health-related pages

TSA-011 acceptance says there is no third-party tracker on child-reachable or health-related pages. Gtm loads on every page except Photo pairs, Picture puzzle, Scrapbook and the kids guides under `/kids/` (CNT-880, 2026-11-21), so it is on the caregiving, brain-health and activity guides, and on other pages a child can reach. **This is open for the maintainer** (section 6, item 1). This inventory records the current state and does not change it.

---

## 6. Open maintainer decisions

1. **Analytics vendor (open maintainer decision).** Google Tag Manager (`GTM-5ZSV72WC`), which loads Google Analytics 4, runs on every page except the no-analytics pages in section 4a (Photo pairs, Picture puzzle, Scrapbook, and `/kids/`). `docs/specs/global/14-trust-safety-accessibility-privacy.md` (TSA-011) and `DESIGN.md` section 7 both call for no third-party trackers on child-reachable or health-related pages. Keep the vendor, remove it from the health and child pages, or move to a first-party measure. The website code will not add or remove a vendor without the maintainer's decision.
2. **GA4 settings.** `Analytics.astro` says Google signals and ad personalization are off, but this is set in the Google console, which is not in the repository. Record the GA4 retention period and these settings in the console and the privacy notice before sign-off.
3. **Cookies from Google's tag.** Confirm the cookie names in section 1 in a clean browser profile.
4. **Sign-off.** Maintainer sign-off on this inventory is pending.
