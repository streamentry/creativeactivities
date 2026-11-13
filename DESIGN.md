---
name: Creative Activities
description: Warm, capable, calm and dignified. An activity, ready in one glance.
colors:
  primary: "#24372F"
  ink: "#24372F"
  ink-deep: "#16231D"
  canvas: "#FAF8F2"
  paper: "#FFFFFF"
  sage: "#D9E8DA"
  teal: "#176C65"
  teal-pale: "#E3F0EE"
  teal-outline: "#B5D3CF"
  clay: "#BB6C4D"
  sun: "#F4CD76"
  sun-pale: "#FBE8B5"
  muted: "#51635A"
  border: "#D9DED7"
  outline: "#66786E"
  high-contrast-surface: "#FFFFFF"
  high-contrast-on-surface: "#111111"
  shadow-ink: "#24372F"
  on-ink: "#FAF8F2"
  on-ink-variant: "#D9E8DA"
  on-ink-link: "#F4CD76"
  success: "#256B29"
  warning: "#8C4A00"
  danger: "#A32D32"
typography:
  body-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.6
  headline-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 30px
    fontWeight: 700
    lineHeight: 1.2
  label-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.2
---

# Creative Activities — Design System & Experience Principles

**Product:** creativeactivities.org  
**Design ambition:** The gentleness of a well-made children's book, the clarity of a field guide, and the usefulness of a good recipe. **Never a hospital portal; never a noisy kids' app.**  
**Status:** Initial design direction. Test with actual participants and caregivers before treating it as final.

## 1. Product feeling

**Warm, capable, calm, and dignified.** We are designing for a stressed adult making a practical choice and for a participant who may prefer large text, clear visuals, fewer decisions, or sensory calm.

This is not “cute disability design.” Avoid babyish motifs for older adults and stereotyped medical imagery. Show creativity, hands, materials, family connection, and different ways to participate.

### Signature experience: an activity, ready in one glance

Above the fold of an activity page, show:

> **Make a memory collage**  
> *A relaxed creative activity using photos and paper.*  
> **10 min setup · 15–30 min activity · seated-friendly · low-cost**  
> **Materials:** photos, paper, glue stick  
> **[Start activity] [Print one-page card]**

The page is successful when someone can start, not when they admire our design.

## 2. Visual identity

### Wordmark

Use **Creative Activities** as the visible name; `creativeactivities.org` in the footer and share materials. A simple wordmark is better than an over-literal logo containing a heart + hands + brain + paintbrush.

**Logo:** two overlapping pieces of paper, a clean-cut ink leaf and a hand-torn clay sheet, with their shared space in sun. The brief and acceptance tests are in [LOGO.md](LOGO.md); the art lives in `brand/`:

| File | Use |
|---|---|
| `brand/mark.png` | Primary mark with room around it; splash screens, cut out for share images and the favicon |
| `brand/app-icon.png` | Full-bleed app icon, Android adaptive foreground, web touch icons |
| `brand/app-icon-dark.png` | Dark variant on `ink-deep`; not wired up yet |
| `brand/mark-mono.png` | One-color stamp (transparent) for print and single-color use |
| `brand/lockups.png` | Reference for the horizontal, stacked and footer lockups |

Regenerate app icons with `python3 scripts/make_brand_icons.py`, then `dart run flutter_launcher_icons` and `dart run flutter_native_splash:create` (review the native diff: keep the hand-made iOS launch storyboard); website icons and share images with `site/scripts/make-images.py`. The art is raster and AI-assisted: a vector redraw and the resemblance search in LOGO.md are still open before it is treated as final.

### Palette (proposed tokens; validate contrast)

| Token | Hex | Use |
|---|---|---|
| `ink` | `#24372F` | Main text, icons, primary button background (also the `primary` token) |
| `canvas` | `#FAF8F2` | Main warm off-white background |
| `paper` | `#FFFFFF` | Activity cards and print surfaces |
| `sage` | `#D9E8DA` | Soft contextual background, never sole indicator |
| `teal` | `#176C65` | Links and interactive accents (verify state contrast) |
| `clay` | `#BB6C4D` | Illustration and sparing accents; not default small text |
| `sun` | `#F4CD76` | Playful highlight, labels with dark text |
| `muted` | `#51635A` | Secondary text (verify contrast in context) |
| `border` | `#D9DED7` | Dividers and input borders |
| `danger` | `#A32D32` | Warnings, with text and icons, not color alone |

Target **WCAG 2.2 AA** for interfaces: 4.5:1 normal text, 3:1 large text and relevant UI boundaries where applicable. Validate every actual token pairing rather than assuming the palette is compliant. Do not place small text directly on `sun`, `sage`, or imagery without an approved contrast pairing.

### Type

- **UI and body:** `Atkinson Hyperlegible Next` or a similarly legible, openly licensed sans serif, with system fallbacks. If unavailable or licensing is unsuitable, use a high-quality system sans stack.
- **Headings:** the same family with restrained weight changes. Avoid decorative handwriting in instructions.
- **Body default:** 18 px / 1.6 line-height on activity pages; scalable to 200% without loss of function.
- **Content width:** approximately 65–72 characters for instruction text; clear headings and generous spacing.
- **Tap targets:** target at least 44 × 44 CSS px for primary interactions; don't rely on tiny chips alone.
- **Motion:** gentle and functional; respect `prefers-reduced-motion`, with no autoplay animations.

### Imagery

Primary imagery should show **actual materials, actual steps, and what a finished or partially finished activity can look like**. Prefer original, rights-cleared photos or tactile illustrations. Include diverse age groups and family structures without tokenistic staging. Avoid showing a single “correct” outcome: making is more important than perfection.

Use neutral backgrounds, uncluttered workspaces, sufficient visual separation, meaningful alt text, and captions explaining what matters in a step. Photos should never be the only form of instruction.

## 3. Information architecture

Top-level navigation:

- **Find an activity** (primary)
- **For older adults**
- **For kids & families** (only once content is substantial)
- **Printables**
- **About & safety**

Homepage should have one clear question: **“What would you like to do together?”**

Then offer two paths:

1. **I know what I need** → searchable topic and audience pages.
2. **Help me choose** → a short, optional activity finder.

Don't force users to choose a diagnosis. Allow “I don't know” and “any” for every filter.

### Finder filters (progressive disclosure)

Start with no more than 3 visible choices: **time**, **materials**, **type of activity**. Reveal optional fit filters for **energy**, **mobility**, **sensory preferences**, **communication**, **group size**, **mess tolerance**, and **supervision**. Avoid asking about health conditions unless a specific safety reason warrants it.

Results explain **why this fits** and offer a lower-effort alternative, not a mysterious “AI match score.”

## 4. Required page templates

### A. Search landing hub

1. Precise H1 matching the reader's task (not a string of keywords).
2. Direct, useful opening answer and selection guidance.
3. A curated set of genuinely relevant activities with meaningful differentiation.
4. Fit and safety considerations for that particular context.
5. Common questions answered concisely; link to more detailed guides where necessary.
6. Editorial byline, update date, sources for relevant claims.
7. Optional app recommendation only if a distinct workflow makes it better than the web.

**SEO anti-pattern:** 25 hubs that are the same list with “senior” swapped for “dementia” or “child.” Consolidate duplicates and use internal links.

### B. Individual activity

**Order matters:**

1. Name, plain-language purpose, hero image or illustration.
2. At-a-glance facts: prep time, activity time, cost, mess, materials, space, supervision.
3. **Start / Print / Save** buttons.
4. Steps, each with one action and optional image.
5. Variations: easier / less sensory input / seated / bedside / more collaborative, only where appropriate.
6. Safety and what to avoid; graceful exit if the participant is tired, distressed, or uninterested.
7. What to do next, plus related activities.
8. Author, reviewed by (if applicable), dates, references, and correction link.

The **print page** must remain useful with no internet, no color ink, and no URL access; include short URL/QR as optional extras. Use `@media print` to remove navigation and unnecessary decoration.

### C. Collection / printable pack

A compact set of activities for a situation (e.g., “five quiet bedside crafts”), editable or printable checklists, supply list, and clear nonclinical scope. Keep the individual canonical pages accessible to search engines and users.

## 5. Content design and data model

Every published activity must have structured editorial metadata, regardless of CMS:

```text
id: memory-collage-001
slug: memory-collage
name: Make a memory collage
summary: Create a collage from photos and everyday paper.
locale: en
estimated_prep_minutes: 10
estimated_activity_minutes: [15, 30]
materials: [printed_photos, paper, glue_stick]
settings: [tabletop, seated]
energy: low
sensory_notes: [visual, tactile]
communication_modes: [spoken_optional, nonverbal_possible]
accessibility_adaptations: [large_grip, pre_cut_shapes]
safety_flags: [adhesive_sensitivity_check]
supervision: situational
steps: []
variations: []
images: []
author: null
reviewer: null
last_reviewed_at: null
sources: []
translation_review_status: pending
```

Fields describe *the activity*, not an inferred medical profile. Do not publish empty placeholder author or safety metadata as if reviewed. Structured data on the website must correspond to real visible content and conform to search engine guidelines.

### Editorial voice

**Use:** “Try together,” “You can adapt this,” “If they prefer, offer a choice,” “It is fine to stop.”  
**Avoid:** “Fix your loved one,” “Brain recovery guaranteed,” “Childproof activities for autistic kids,” “Patients must complete,” “Ten minutes to improve cognition.”

Use person-first or identity-first language according to the individual's or community's preferences, and respect regional conventions. Avoid treating all autistic people, older adults, or people living with dementia as homogeneous.

## 6. Accessibility and inclusion are core UX

Test at minimum:

- Keyboard-only navigation, visible focus, semantic headings, form labels, sensible screen-reader order.
- 200% text zoom and responsive reflow on 320 CSS px viewports without horizontal scrolling for ordinary content.
- Text alternatives for instructional images and captions for any essential video.
- High-contrast mode, reduced motion, and no color-only instruction.
- Comprehension with people who prefer short language; instructions broken into one action per step.
- One-handed and low-dexterity use, including print as an alternate modality.
- Low-speed mobile connections; no dependence on autoplay videos or large JavaScript bundles.
- Cultural and practical fit: low-cost supplies, substitutions, local units, translated materials, and instructions that work without shopping at specialty stores.

Recruit users who rely on assistive technology for research; automated accessibility scans are necessary but insufficient.

## 7. Performance and engineering posture

**Progressive enhancement:** HTML content and critical navigation work before JavaScript. Add interactivity only where it decreases friction.

Initial targets (engineering budgets, not promises):

- Aim for **LCP ≤ 2.5s**, **INP ≤ 200ms**, and **CLS ≤ 0.1** at the 75th percentile of real-user experiences, on mobile and desktop as applicable.
- Keep initial activity pages lightweight; compress images, set dimensions, lazy-load below-the-fold media.
- Avoid third-party trackers, heavy chat widgets, and pop-ups before the first activity.
- Server-render or pre-render indexable pages; canonical tags, sitemap, clean links, proper language tags for reviewed translations.
- Use robots directives thoughtfully; don't block critical content from search crawlers. Don't assume AI crawlers all use the same rules.
- Keep anonymized analytics minimal and consent-aware where required; never put inferred diagnoses or freeform family stories in event payloads.

## 8. The memorable feature: Activity Cards

Every activity gets a printable/shareable **Activity Card** with:

- A clear title and actual preview image.
- **What you need** and **what to do** on one side.
- **Make it easier / make it different** on the other.
- A calm “It's okay to stop or change it” note.
- A tiny source attribution and optional short URL.

Cards are useful in a care home, classroom, family chat, or on a refrigerator. **This physical artifact is a product and a potential organic distribution channel.** Test whether people actually share, print, and use them; do not assume they will.

## 9. No-dark-pattern policy

- No required account to read an activity or download a basic printable.
- No ads masquerading as activity instructions.
- No modal that blocks a useful answer to demand an app install.
- No emotional manipulation about being a “good caregiver.”
- No shame streaks, artificial scarcity, or deceptive clinical badges.
- No sale of sensitive participant information.

## 10. Design QA checklist for every launch

- [ ] A first-time visitor can identify a suitable activity without creating an account.
- [ ] The page answers the user's actual search intent in its first screen.
- [ ] Materials, time, safety, accessibility adaptations, and steps are accurate.
- [ ] An adult participant is represented respectfully; preferences and choice are explicit.
- [ ] Keyboard, screen reader, zoom, small screen, and print flows are tested.
- [ ] Images are original or licensed, instructional, optimized, and have correct alt text.
- [ ] Any health-related statements are appropriately supported and scoped.
- [ ] Metadata and structured data accurately reflect visible content.
- [ ] Relevant language/region has had human review before localization goes live.
- [ ] The activity works without installing anything or submitting personal data.

## The design test that matters most

Hand the page to someone who is tired, has five minutes, and wants to do something kind for someone they love.

**Can they begin without asking you a question?** If not, simplify it before adding features.
