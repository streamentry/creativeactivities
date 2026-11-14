# Activity card usability sessions (Stage 1)

Status: plan, written 2026-11-14. No session has been run. Results go in the log at
the end; until then every claim about usability is a hypothesis.

## Why

VISION.md › Stage 1 asks for 8–15 usability sessions "across devices, ages, and
accessibility needs" and lets the library grow only if "most observed test users can
find and start an appropriate activity quickly" with "no unresolved critical
safety/accessibility defects". This plan turns that gate into tasks, observations and
a pass rule, so sessions are comparable and the decision is not made on impressions.

## Who to recruit

Aim for 10 sessions; stop at 8 if the pattern is clear, go to 15 if it is not.

| Group | Sessions | Why |
| --- | --- | --- |
| Family caregivers of an older adult (with or without dementia) | 4–6 | The primary searcher |
| Activity staff or volunteers (care home, day program, library) | 2–3 | Group use and printing |
| Older adults choosing for themselves | 1–2 | "Activities for seniors" searches |
| A person using a screen reader, zoom at 200% or a switch | 1–2 | DESIGN.md › Accessibility |

Mix devices: at least 3 phones, 2 tablets, 2 laptops, and one session where the card
is printed. Recruit through existing contacts, a library or a caregiver group. Offer a
thank-you that is the same whatever the feedback.

## Consent and privacy

- Read the consent script before starting. Participation is optional and they can stop
  at any time without giving a reason.
- Do not ask about anyone's diagnosis or health. If they volunteer it, do not write it down.
- Do not record audio, video or the screen unless they agree separately, out loud, to
  that. Never record the person they care for.
- Notes use a session number, never a name. Keep notes off shared drives with family
  photos, and delete raw notes after the summary is written.
- AGENTS.md applies: no diagnoses or personal details in commits, issues or AI tools.

## Setup

- Use the live site, or a preview build if the change is not deployed yet.
  Write down the commit or URL tested.
- Start every task from a search results page you print or show (a mock-up is fine), not
  from the site's home page, because most visitors arrive from search.
- Have paper, a pen and a printer available for task 4.

## Tasks

Read each task aloud. Do not explain the site. If they are stuck for two minutes, say
"Let's move on" and record it as not completed.

1. **Find.** "You have about 15 minutes this afternoon with your mother and nothing to
   buy. Find something you could do together." Starts on `/activity/`.
2. **Start.** "Show me how you would start it." Watch whether they reach the steps,
   read the materials and notice the easier version.
3. **Adapt.** "She is tired today and would rather stay in her chair. What would you
   change?" Watch for the variations and the stop note.
4. **Print.** "Print this so you can use it at the table." Check the printout: one
   page, readable, no lost steps.
5. **Situation.** Starts on a search result for "bedside activities" (or "activities
   for seniors" for older adults choosing for themselves). "Find one that would work
   here."
6. **Save or share.** "Your brother asked for ideas. How would you send him this one?"
7. **Stop.** "Halfway through she says she has had enough. What does the page suggest?"

For staff, replace task 1 with "Find something for six residents at a table for half
an hour" and add the printable pack (`/activity/packs/five-activities-for-a-week/`).

## What to observe

For each task, note:

- Completed: yes / with help / no.
- Time from the task being read to the first useful action (opening a suitable card,
  reaching the steps).
- Where they hesitated, went back, or said something was unclear. Quote their words.
- Anything that felt childish, clinical, pushy or like a test to them.
- Safety: did they notice the safety notes? Did any step look unsafe to them?
- Accessibility: text size, contrast, target size, screen reader announcements, print.

Close with three questions: "What would make you come back?", "What would you change
first?", and "Is there anything here you would not trust?"

## Severity

| Level | Meaning | Example |
| --- | --- | --- |
| Critical | Could cause harm, or blocks the task for an accessibility need | A step that is unsafe as written; a control a screen reader cannot reach |
| Major | Blocks or badly slows the task for many | Finder results that do not match the choices |
| Minor | Slows or confuses, with a workaround | A label read two ways |

Critical issues are fixed before any new content is published.

## Pass rule (from VISION.md › Stage 1)

Proceed to Stage 2 only if all of these hold:

- At least 7 in 10 participants complete tasks 1 and 2 without help.
- The median time to the first useful action in task 1 is under 2 minutes. This is a
  starting threshold; replace it with a baseline after the first 5 sessions.
- No open critical issue.
- No participant reports that a page felt like a test, a diagnosis, or a claim to
  treat anything. If one does, fix the wording and note it here.

Search impressions and query coverage, the other half of the gate, come from Search
Console and are tracked separately.

## Session log

| # | Date | Group | Device | Commit or URL | Tasks completed unaided | Median time, task 1 | Critical / major issues | Notes summary |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | | |

After each round, record the decision (proceed, fix and retest, or stop) and the
issues opened, in WORKBOARD.md.
