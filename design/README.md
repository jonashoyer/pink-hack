---
provenance: "Unvetted Synthetic"
---

# Kindalong approved design

This is the single current design specification for the existing Lovable frontend. The latest user decision selects **Kindalong** and the **previous pink/rose theme** for Lovable and presentation. It supersedes the Here With You name and Airy Sage palette. The selected Home / Journal / Symptom navigation and daily self-reported rating requirements remain. The sole Lovable writer implements and publishes in its own thread; Main transfers ownership and reconciles docs.

## Layout references and current identity

| Reference | File |
| --- | --- |
| Phone app: all three tabs | [App](screens/app.png) |
| Desktop Home | [Home](screens/web-home.png) |
| Desktop Journal | [Journal](screens/web-journal.png) |
| Desktop Symptom | [Symptom](screens/web-symptom.png) |
| Selected logo: F — Held (user, 24 Oct) | [SVG masters and exports](assets/kindalong/) · [8-direction exploration](logo-exploration/index.html) |
| Superseded logo: B — A listening line | [Old reference](assets/logo-reference.png) |

Use the **Kindalong** wordmark and previous pink/rose theme consistently in Lovable and presentation. The existing four screenshots and logo sheet show the superseded Here With You/Sage identity; retain them as layout and geometry references, not current-brand exports. The user selected logo **F, Held**, a heart cradled by an open hand, which replaces the listening line. Heart: rose `#a04b6f`, the deck accent `oklch(53% .12 355)`. Hand: petal `#e199af`. On rose or dark surfaces, use [mark-reverse.svg](assets/kindalong/mark-reverse.svg), with a white heart and a `#f5c1cc` hand. Use [mark-mono.svg](assets/kindalong/mark-mono.svg) where only one colour is available. The lockup is the mark beside "Kindalong" in a semibold serif (Georgia-like), with the mark about 1.6× the wordmark cap height. It is decorative next to the wordmark. Favicon, apple-touch and app-icon exports are in the same folder and have been checked at 16, 32 and 512px. Keep the mark small in app headers. Fresh implemented screenshots must come from the sole Lovable writer before the presentation labels them current.

The screenshots are static image prototypes with fictional data. They do not implement a frontend, native app, backend behavior, or deployment. Their content is illustrative; never seed real records with the example rating or symptoms as a side effect of rendering.

## One product and three primary destinations

| Destination | Purpose | Web | Phone |
| --- | --- | --- | --- |
| Home | Today, daily overall health rating, Record a note, recent entry, links to Journal and trends | Sidebar | Bottom tab |
| Journal | Date-ordered notes, editable selected note, its daily rating, voice recording | Sidebar | Bottom tab |
| Symptom | Five-day trends, All or one symptom, period selector, symptom management, separate overall health rating | Sidebar | Bottom tab |

Use the exact labels **Home / Journal / Symptom**. Home is the app's default destination. Keep one app shell, one set of components, one theme, and shared data. Do not build separate desktop and phone applications with independent styles or data. Native packaging has not been implemented or selected.

Pages is not a primary tab. Preserve the backend's existing context pages and the assistant's use of them. Keep any existing context-page editing reachable through secondary settings rather than deleting records or disabling context. Day plans remain ordinary editable Journal blocks.

## Visual system

Restore the previous pink/rose visual treatment from the existing Lovable frontend: warm light surfaces, readable dark text and rose accents for actions and selection. Reuse those existing tokens rather than inventing a new palette. Keep thin rules, whitespace and the established typography/layout hierarchy. Accessible text and touch targets remain required.

[theme.css](theme.css), scoped to `.here-with-you`, is the preserved **superseded Sage token reference**. It is not the active Kindalong palette and must not override the previous pink/rose tokens. The sole Lovable writer restores/maps the existing pink/rose theme in the external frontend. This documentation change does not alter CSS or publish a frontend.

On desktop, use a quiet sidebar and a comfortable content width. On phone, use three bottom tabs, safe-area padding, touch targets of at least 44px, and a compact All symptoms selector. Avoid the former six-chip grid. Keep voice controls reachable without covering content. Home has a short note preview; Journal holds the full text; Symptom holds the chart. Empty, loading, save failure, and stopped states should be clear and concise.

## Daily overall health

This is the person's **self-reported** rating: **1 = very poor, 10 = very good**. Label it Overall health / Your daily rating, and allow editing. It is not a calculated symptom average or clinical assessment. Higher is better. Show **Not rated** when missing. Do not infer a number from qualitative speech.

The selected day comes from Journal `journal_date` and profile timezone, currently UTC. Overall health uses the latest explicitly recorded valid `overall_health` for that day, ordered by `created_at` then ID. Explicit Save updates that source entry with full merged properties, expected revision and a stable operation ID. If no valid rating exists but that day has entries, Save updates the latest day entry. If today is empty, an explicit Save creates an ordinary current-day Daily rating entry containing only the selected value. Empty historical days are not created by this flow. These are user writes, not seeded or inferred observations.

## Symptom trends

All overlays separate series in one chart; individual choices isolate a series. Example symptoms are fatigue, nausea, pain, appetite loss, and sleep difficulty. Users choose what they track; these are not required fields. All examples measure severity on **0 = none, 10 = severe**, so higher is worse. Sleep difficulty means severity, not sleep hours.

Use the selected range's local calendar dates. Only overlay compatible scales. Missing data stays missing and breaks the line, never zero or silently interpolated. Use desaturated series colours plus names, dash patterns, markers, and accessible numeric details. Do not add overall health as a sixth symptom line, because its direction and scale differ.

For each key and `journal_date`, select the latest valid explicitly recorded value, ordered by `created_at` then ID, and expose its source entry. A newer entry omitting a key does not erase an older valid same-day value. Optional severity keys are `fatigue`, `pain`, `nausea`, `appetite_loss` and `sleep_difficulty`, each finite numeric 0..10. `overall_health` is separate finite numeric 1..10; `sleep_hours` is ordinary uncharted duration. Missing, null, nonnumeric and out-of-range values stay missing; missing days break lines. Load the entire selected interval through pagination. Delta compares the exact first and last selected calendar days; show Not enough data if either endpoint lacks a valid value. Do not average, interpolate or invent observations.

Illustrative chart data for reviewing the artwork:

| October 2026 | Fatigue | Nausea | Pain | Appetite loss | Sleep difficulty |
| --- | --- | --- | --- | --- | --- |
| 20 | 6 | 4 | 3 | 7 | 5 |
| 21 | 5 | 3 | 3 | 6 | 4 |
| 22 | 4 | 3 | 4 | 5 | 5 |
| 23 | 4 | 2 | 4 | 4 | 3 |
| 24 | 3 | 2 | 5 | 3 | 4 |

The example daily overall health on October 24 is 7/10. No earlier health ratings are specified. Implement charts from real numeric observations; image-generated graph geometry is visual guidance.

## Existing frontend and deployment boundary

The [public landing](https://pink-hack-journal.lovable.app/) and [app](https://pink-hack-journal.lovable.app/app) are two routes of the existing external Lovable frontend. **Pushing this repository does not automatically apply these image prototypes to Lovable.** This checkout has the backend, client library, documentation, and design assets; it has no frontend React route/component source or native app project.

Historical browser/connector observations during design consolidation included Pink Hack branding, the older Journal / Your pages layout, unavailable-server feedback and a connection-specific `404 project_not_found`. Kindalong branding is now published on the existing routes at source `a3fc982cbf666e963c5eeef7eb10428dc984940b`, Lovable deployment `bc2ab442-b0d5-4acc-a4c9-1cc6ad8b3b62`. The landing restores the historical pink/rose treatment, and the app changes visible brand/ARIA literals and metadata only. App behavior, layout/classes, global styles, voice/API/configuration and retained data were not changed by that rebrand. Actual desktop screenshots show the current three context pages, empty Journal and Server connected. This does not implement Home / Journal / Symptom, daily ratings or trends, or prove spoken behavior. Those interface requirements and the one human mic test remain separate work. Detailed publication evidence is in [demo validation](../docs/demo-validation.md).

Use [the frontend handoff](lovable-handoff.md) to update that existing project. Keep `/` as its landing and `/app` as its app entry, with matching identity. Do not provision another Lovable project, backend, or database to adopt this design. The current fixed-demo API contract remains authoritative in [app-structure.md](../docs/app-structure.md): the server owns `demo-user`; browser visitors share records with no login. Do not reintroduce user tokens or change device credentials as a design task.

## History and verification

Superseded mockups, unselected logos, old prompt sets, and the earlier Today-first HTML design have been removed from the active tree. Recover the complete prior exploration from checkpoint **5f9ba1c** in Git history. That checkpoint is local until a permitted push succeeds.

There are exactly four screen PNGs, one selected-logo reference, and one [historical generation prompt set](generation-prompts.json) in this package. [manifest.json](manifest.json) identifies the files and checksums. The generation prompts describe the provenance of the images; this document and current backend contracts govern implementation. Historical prompt wording never overrides them.
