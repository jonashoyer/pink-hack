---
provenance: "Unvetted Synthetic"
owner: "Demo/presentation worker (Claude Opus), child of Main a4366dab"
last_verified: "2026-10-24 15:40 CEST (deck render check)"
---

# Kindalong presentation

**Draft deck: `index.html`, 6 slides, planned 2:40 (unrehearsed), speaker notes under "Notes".** Open it locally and present with the arrow keys; `F` toggles fullscreen and `?` opens help. This is not a finished live-voice presentation. Slides 3 and 4 say "designed to" and "expected result, unverified" until the one human microphone test, coordinated by `mcp:1e1bffb3`, returns real evidence. The gates and evidence are in [demo validation](../docs/demo-validation.md). The story is in [the demo script](../docs/demo-script.md) and [the deck outline](../docs/demo-deck-outline.md). `here-with-you-draft.html` is an earlier Here With You draft, kept as history.

Check at 15:40 CEST, headless Chrome and T3 browser at 1440×810:
- All 6 slides render with no overflow.
- Both images load.
- Arrow navigation runs from 1/6 to 6/6, and the Notes dialog opens with timing.
- No "Here With You" text remains.
- Both links go to https://pink-hack-journal.lovable.app/app.
- Real fullscreen was not exercised in automation.

## Remaining gates before presenting

1. **Voice write (G3–G5, G7).** The first human Start failed with **429** ("hourly voice initialization limit") before any provider session was created. There is no transcript, write or Stop proof. The quota has been removed in `dpl_3RPxVYsSXfwcTEUrc3DBVH4QGpvr`. One controlled retry by the mic thread `mcp:1e1bffb3` waits for the Status owner's rev 3 tracking manifest. Only a passing run, with a saved entry and readback, enables variant A and a refresh of slides 4–5 with the real result and screenshot.
2. **Fallback recording (G10).** None exists. It exists only if a validated run is recorded.
3. **Atech (G8).** Unproven; the device disconnects before listening. Slide 5 lists it as still to prove.
4. **Timing.** Planned at 160 s; **not yet rehearsed by a human**. Time one full run of variant B now, and of variant A if it becomes available.
5. **16:15 check.** Open `/app` signed out, then check the shared Journal and pages for visitor edits.
6. **User decisions.** Presenter and driver. Team names "Jonas · Klara · Chloé" (from the Notion Event context). Check-in is **done**, per Main.

## Rehearsal sequence

All-in timeline, **planned and not yet rehearsed**: 160 s, leaving 20 s of margin to 3:00. Spoken words run at about 150 per minute.

| Time | Slide | Budget |
| --- | --- | --- |
| 0:00–0:08 | 1 Title | 8 s |
| 0:08–0:28 | 2 Emma | 20 s |
| 0:28–0:45 | 3 Product | 17 s |
| 0:45–2:05 | 4 Demo | 80 s all-in, including switches |
| 2:05–2:20 | 5 Evidence | 15 s |
| 2:20–2:40 | 6 Next step | 20 s |

Setup: open `index.html` in one window, and https://pink-hack-journal.lovable.app/app in another, signed out.

**Slide 4, variant B (current default, about 40 s):**
1. Switch to the app (5 s).
2. Open "My breast cancer recovery (demo)" and "What helps me (demo)" (10 s). Both are verified to render.
3. Say: *"Voice is built and wired. Our first live start was blocked by a usage limit, now removed; the first spoken save is still being validated."* (10 s)
4. Show the Journal: empty, with "Server connected" (8 s).
5. Switch back (5 s).

Do not press Start, and don't save edits to the shared demo pages.

**Slide 4, variant A (only after the mic thread reports a passing human run):**
1. Switch to the app (5 s).
2. Show two pages (10 s).
3. Press Start and say Emma's request (about 28 s).
4. Wait for the entry (at most 20 s).
5. Open and reload it (12 s). If the wait passed 20 s, skip the reload.
6. Press Stop and switch back (5 s).

Say "saved" only once the entry is visible. Before presenting, move "real spoken save" to the verified column on slide 5.

There is no recording fallback. The Atech device is shown only as local mic and speaker; it is not connected to the Journal.

## Name and theme

The product is **Kindalong**, a companion for life after breast cancer. It uses the pink/rose theme. "Here With You" and the Airy Sage theme are superseded.

Palette, taken from the published CSS at source `a3fc982c`:

| Role | Value |
| --- | --- |
| Paper | `oklch(98.9% .003 80)` |
| Ink | `oklch(29% .012 350)` |
| Muted ink | `oklch(52% .01 350)` |
| Accent (rose) | `oklch(53% .12 355)` |
| Rose surface | `oklch(94.7% .027 12)` |
| Line | `oklch(92% .008 350)` |

## Assets

| File | Use |
| --- | --- |
| `assets/kindalong-landing-a3fc982c-desktop.png` | **Current, slide 1.** Real public landing page. It was captured before hydration, so it shows the fallback button. |
| `assets/kindalong-app-a3fc982c.png` (from `.webp`, used on slide 3) | **Current.** Real `/app`: the three Emma demo pages, an empty Journal, "Server connected". It shows the state before any voice run. |
| `assets/web-home.png` | Design prototype with example data ("Overall health 7/10", symptom trends). It uses the old brand. Show it only labeled as a prototype, never as the app. |
| `assets/listening-line.png`, `assets/landing-here-with-you-919d8ed5-desktop.png`, `assets/landing-lovable-screenshot-65f746ff.png` | Historical. Do not present as current. |

The screenshot of the saved Emma entry comes from the human microphone test. A fallback recording exists only if that run is validated.

## Links

- Landing: https://pink-hack-journal.lovable.app/
- App: https://pink-hack-journal.lovable.app/app. This is a shared demo space; everyone sees the same entries.
