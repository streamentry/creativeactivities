# Assistive-technology session checklist

Status: draft, 2026-11-14. Used with the [S1 usability protocol](s1-usability-protocol.md) for TSA-002. It is a moderator checklist, not a certification. Passing it does not replace a session with a person who uses the technology daily.

Project rules that apply to every item: WCAG 2.2 AA is the release gate ([TSA-001](../specs/global/14-trust-safety-accessibility-privacy.md)); targets are at least 48px; focus is always visible; no information is given by colour alone; the page works at 320px wide and at 200% zoom; reduced motion is respected; the printed card works ([DESIGN §6](../../DESIGN.md)).

## 1. Before the session

- [ ] The participant uses their own device, browser and settings. Record them in the session log.
- [ ] The build under test is recorded: commit hash or deployment date, and the URL.
- [ ] The participant chooses the technology. Do not install new software for them.
- [ ] The moderator knows the basic gestures for each technology (below) but does not demonstrate them unless the participant asks.
- [ ] Session notes record the technology name and version, and the OS version.

## 2. Pages to cover in every AT session

| Page | Why |
| --- | --- |
| Home page | Start point for T1 |
| The activity finder (`/activity/`) | Filters are radio groups with labels; check that the group names are read |
| One activity page | Steps, materials and adaptation notes must be reachable and in order |
| One hub page (for example `/activities-for-seniors/`) | Long list of links; check headings and link names |
| The printed view of one activity | Print or save; the printed page must have the steps |
| Today page (`/today/`) | The free-text box must have a label |
| One picture game | Picture games are the main interactive surface; check names of buttons and tiles |

## 3. Technology-specific checks

### VoiceOver (iPhone, Safari)

- [ ] Turn on VoiceOver; the page title is announced on load.
- [ ] Rotor headings list: the page has one `h1` and headings that match the page's structure.
- [ ] Landmarks (header, navigation, main, footer) are announced.
- [ ] Every link and button has a name that makes sense out of context.
- [ ] Finder: each option is announced with its group name ("Time, radio button, 10 minutes").
- [ ] Activity steps are read in order, and no step is skipped by a visual-only layout.
- [ ] Focus moves to the new content after a filter changes or a result is shown.
- [ ] Text-size setting: large text does not clip the page.

### TalkBack (Android, Chrome)

- [ ] Turn on TalkBack; the same heading, landmark and link checks as VoiceOver.
- [ ] Explore by touch: each interactive element is reachable and speaks its name and state.
- [ ] Radio buttons and checkboxes announce selected or not selected.
- [ ] Focus is not trapped in the finder, the game board or the print dialog.

### NVDA (Windows, Firefox or Chrome)

- [ ] Start NVDA; use browse mode to read the page, then H (headings), K (links), and R (landmarks).
- [ ] Forms mode: each field has a label that NVDA reads when focused.
- [ ] Tab order follows the visual order. Shift+Tab reverses it.
- [ ] Escape closes any dialog and returns focus to the control that opened it.

### Switch Control (iPhone) or Switch Access (Android)

- [ ] Every control can be reached by scanning, with no timed actions.
- [ ] A switch user can complete T1 without a second switch or a gesture that needs two fingers.
- [ ] Picture games can be played with a single switch: the item to choose is reachable in a single scan cycle, or the participant reports that the scan is too slow.
- [ ] No action needs a long press or a drag, unless a single-tap alternative exists (TSA-004).

### Voice Control (iPhone) or Voice Access (Android)

- [ ] The "show numbers" or "show names" overlay can name every link and button.
- [ ] Spoken names match the visible labels. A visible label that is not in the accessible name fails.
- [ ] A typed search field can be filled by voice.

### Browser zoom and magnification

- [ ] 200% browser zoom on a laptop: no horizontal scrolling for text, and no content is hidden.
- [ ] 320px width (or the phone's largest zoom setting, as an approximation): the layout reflows, the navigation stays usable, and the finder remains readable.
- [ ] The operating-system magnifier (full-screen or lens): focus follows, and the sticky header does not cover the focused item.
- [ ] Large text setting on the phone: text grows, buttons keep their size, and no text is cut off.

### Keyboard only (no AT, used as a baseline)

- [ ] Every control reachable with Tab, and the focus outline is visible at all widths.
- [ ] No keyboard trap.
- [ ] Skip link or landmarks let a keyboard user reach the main content.

### Low vision and colour

- [ ] Contrast of text and key controls meets 4.5:1 for text and 3:1 for controls and focus.
- [ ] Information is not conveyed by colour alone (the gold border in picture games is paired with a label or shape).
- [ ] Reduced motion setting on: no auto-playing or looping motion, and transitions are short or removed.

### Arthritis and limited dexterity

- [ ] Targets are at least 48px (project standard). Measure at least the primary buttons.
- [ ] No action needs precise dragging, double-tap or a timed hold.
- [ ] Spacing between adjacent targets is enough to avoid a wrong tap.

## 4. Printing and saving

- [ ] Print the activity card from a phone and from a laptop. Check the printed page has the title, materials, steps and adaptation notes.
- [ ] Printed text is readable at arm's length. Mark a page as failing if the print loses its text or steps.
- [ ] Printing a game that has no printable sheet is not a test of print (games print blank by design; see `track.ts`).

## 5. Recording a finding

For each problem, write one line in the session log:

```text
F-___  Severity: Critical / Major / Minor
Technology: ____ (version) on ____ (OS, browser)
Page and element: ____
What happened: ____ (one sentence)
What the person expected: ____ (their words if said)
Spec item: TSA-___ / WEB-___ / other
Retest needed: yes / no
```

A critical finding (for example, a control with no accessible name, a focus trap, or an essential action that works only by pointer) blocks the S1 gate until fixed and re-tested with a participant who uses that technology.

## 6. Limits

- A moderator cannot test a technology the participant does not use. Record "not tested" rather than a pass.
- Automated checks (the project's `check-site.mjs`, axe and Lighthouse runs) catch some problems. They do not replace this checklist, and a clean automated run does not count as a session.
- Results from a survey or a message from a tester are not usability results (TSA-002).
