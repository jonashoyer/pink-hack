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
3. **Atech (G8).** Native connection and audio dataflow are owner-reported (session `b7f15241…`, local Mac backend, tunnel, Azure Live); an audible conversation and a saved Journal entry are unvalidated. The Vercel route is untested. Slide 5 lists it as still to prove.
4. **Timing.** Planned at 160 s; **not yet rehearsed by a human**. Time one full run of variant B now, and of variant A if it becomes available.
5. **Ten synthetic history rows (pending).** The user approved 10 labeled fictional manual Journal rows for Oct 14–23, written by the sole seed worker only after the backend owner deploys an optional `journal_date` on Journal CREATE, and after mic and device clearance. No rows exist yet. Charts are not implemented. Until its manifest arrives and is verified, the deck stays as is. Once verified:
   - Variant B shows "the Journal with ten fictional past days" instead of "the empty Journal".
   - Slide 3's screenshot stays labeled as the earlier empty-Journal capture until a fresh real capture replaces it.
   - Slide 5 lists them as context and persistence illustration, not voice proof, patient validation or a trend feature.
   - Today's genuine voice entry stays separate.
6. **16:15 check.** Open `/app` signed out, then check the shared Journal and pages for visitor edits.
7. **User decisions.** Presenter and driver. Team names "Jonas · Klara · Chloé" (from the Notion Event context). Check-in is **done**, per Main.

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

Setup: open `presentation/index.html` directly in the browser; the reviewer confirmed this works. The local server at 127.0.0.1:8765 refused connections at 16:11, so don't rely on it. Open https://pink-hack-journal.lovable.app/app signed out in a second window.

**Slide 4, variant B (current default, about 45 s, checked by the reviewer at 16:10–16:12):**
1. Switch to the app (5 s).
2. Click "My breast cancer recovery (demo)" and show the fictional-composite label, physical symptoms and worry. Click "What helps me" and show rest after lunch and the sister call at three (10 s).
3. Return to Journal through the sidebar and show it as it currently loads (8 s). Two raw transcript test rows from 16:15 and 16:16 were direct REST writes that bypassed the agent. The backend owner is archiving exactly those two, so they are **not demo examples**. If they still appear, don't open or describe them. The intended result is an agent-written entry with Emma's tracked values and a Day plan, and that is **unvalidated**. Don't create a substitute entry.
4. Say: *"Emma is fictional. These are her saved context pages, and this is her shared demo Journal. Our first browser voice start hit a usage limit before a provider session was created. The backend owner reports that limit removed; a validated spoken save and readback are still pending."* (about 17 s)
5. Switch back (5 s).

Current UI, 16:10: Tap to talk, New entry and Refresh records; no "Server connected" or "Start voice". Do not touch Tap to talk, Save, Archive, New entry or rating controls. Do not type a substitute entry.

**Slide 4, variant A (only after the sole mic owner reports a real transcript, canonical entry, readback and Stop evidence):**
1. Switch (5 s) and show two pages (10 s).
2. Press Tap to talk and say Emma's request (about 28 s).
3. Wait at most 20 s for the entry.
4. Open and reload it (12 s). Skip the reload if the wait goes over 20 s.
5. Press Stop and switch back (5 s).

Say "saved" only once the entry is visible. Then move "real spoken save" to the verified column on slide 5.

There is no recording fallback. **Atech:** native connection and audio dataflow are owner-reported; an audible conversation and a saved Journal entry are unvalidated. Historic local mic and speaker tests are a separate result. Gain and mute firmware is still uploading, and that is not audible or save proof.

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
| `assets/kindalong-landing-a3fc982c-desktop.png` | **Slide 1, pending replacement** by the writer's post-logo capture. Real public landing page. It was captured before hydration, so it shows the fallback button. |
| `assets/kindalong-journal-20261024-1610.png` | **Current, slide 3.** Reviewer capture at 16:10: three current page titles, Tap to talk, empty Journal. |
| `assets/kindalong-recovery-20261024-1610.png`, `assets/kindalong-helps-20261024-1610.png` | **Current, reference for variant B.** Reviewer captures of the two context pages at 16:11. |
| `assets/kindalong-app-a3fc982c.png` | Historical (earlier "Server connected" UI). Not used. |
| `assets/web-home.png` | Design prototype with example data ("Overall health 7/10", symptom trends). It uses the old brand. Show it only labeled as a prototype, never as the app. |
| `assets/listening-line.png`, `assets/landing-here-with-you-919d8ed5-desktop.png`, `assets/landing-lovable-screenshot-65f746ff.png` | Historical. Do not present as current. |

The screenshot of the saved Emma entry comes from the human microphone test. A fallback recording exists only if that run is validated.

## Links

- Landing: https://pink-hack-journal.lovable.app/
- App: https://pink-hack-journal.lovable.app/app. This is a shared demo space; everyone sees the same entries.
