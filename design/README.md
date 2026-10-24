# Here With You — approved design

This is the **single current design specification** for the existing Lovable frontend. The user selected the name, listening-line logo, calm minimal Airy Sage direction, Home / Journal / Symptom navigation, and daily overall health rating in this chat on 24 October 2026. Earlier directions are superseded.

## Approved screens and identity

| Reference | File |
| --- | --- |
| Phone app: all three tabs | [App](screens/app.png) |
| Desktop Home | [Home](screens/web-home.png) |
| Desktop Journal | [Journal](screens/web-journal.png) |
| Desktop Symptom | [Symptom](screens/web-symptom.png) |
| Selected logo: B — A listening line | [Logo reference](assets/logo-reference.png) |

Use these same assets and decisions for web, mobile, and the public landing. The logo is the rounded speech outline with voice strokes, paired with the **Here With You** sans-serif wordmark. Keep it small in app headers. The reference is a bitmap presentation sheet, not a transparent logo export or editable master. Reuse the selected geometry when producing production assets; do not invent another mark or use the earlier overlapping-pages icon.

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

Warm off-white, a faint sage navigation surface, forest gray-green text, and one muted green action colour. Remove bright multi-colour series, peach selections, heavy cards, gradients, and decorative shadows. Use thin rules and whitespace. Serif content headings and sans-serif controls/wordmark follow the screenshots. Keep text readable; minimalism does not mean faint text or tiny targets.

[theme.css](theme.css) is the shared token handoff, scoped to `.here-with-you`. Import it into the existing frontend and map its semantic variables to the installed shadcn theme. It is not loaded by the separate live frontend merely because this file exists in Git. Exact token values and system-font fallbacks operationalize the selected direction; do not claim the images encode exact measured font metrics.

On desktop, use a quiet sidebar and a comfortable content width. On phone, use three bottom tabs, safe-area padding, touch targets of at least 44px, and a compact All symptoms selector. Avoid the former six-chip grid. Keep voice controls reachable without covering content. Home has a short note preview; Journal holds the full text; Symptom holds the chart. Empty, loading, save failure, and stopped states should be clear and concise.

## Daily overall health

This is the person's **self-reported** rating: **1 = very poor, 10 = very good**. Label it Overall health / Your daily rating, and allow editing. It is not a calculated symptom average or clinical assessment. Higher is better. Show **Not rated** when missing. Do not infer a number from qualitative speech.

The score belongs to a local calendar day. All views must resolve the same saved value. The existing API has flexible Journal properties, but no dedicated daily-rating contract is established by the prototypes. Before implementation, agree on one daily source of truth and update/revision rules for multiple entries on the same date. Preserve unrelated blocks/properties, expected revisions, and stable retry operation IDs.

## Symptom trends

All overlays separate series in one chart; individual choices isolate a series. Example symptoms are fatigue, nausea, pain, appetite loss, and sleep difficulty. Users choose what they track; these are not required fields. All examples measure severity on **0 = none, 10 = severe**, so higher is worse. Sleep difficulty means severity, not sleep hours.

Use the selected range's local calendar dates. Only overlay compatible scales. Missing data stays missing and breaks the line, never zero or silently interpolated. Use desaturated series colours plus names, dash patterns, markers, and accessible numeric details. Do not add overall health as a sixth symptom line, because its direction and scale differ.

For a daily display, use the latest explicitly recorded rating per symptom per local date and expose its source entry. Load the full interval, including pagination. Do not silently average multiple observations. Any endpoint change compares the first and last calendar days of the selected interval; show Not enough data when either endpoint is absent.

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

The public browser audit on 24 October 2026 found Pink Hack branding at both routes. The landing led to `/app`; the app showed the older Journal / Your pages layout and Server unavailable with voice disabled. This is an observation, not a diagnosis of the server. The connector returned `404 project_not_found` for the documented project and for the editor identifier exposed by the live badge. No remote frontend code, Git sync, or publication setting was modified or verified.

Use [the frontend handoff](lovable-handoff.md) to update that existing project. Keep `/` as its landing and `/app` as its app entry, with matching identity. Do not provision another Lovable project, backend, or database to adopt this design. The current fixed-demo API contract remains authoritative in [app-structure.md](../docs/app-structure.md): the server owns `demo-user`; browser visitors share records with no login. Do not reintroduce user tokens or change device credentials as a design task.

## History and verification

Superseded mockups, unselected logos, old prompt sets, and the earlier Today-first HTML design have been removed from the active tree. Recover the complete prior exploration from checkpoint **5f9ba1c** in Git history. That checkpoint is local until a permitted push succeeds.

There are exactly four screen PNGs, one selected-logo reference, and one [final generation prompt set](generation-prompts.json) in this package. [manifest.json](manifest.json) identifies the files and checksums. The generation prompts describe the provenance of the images; this document and current backend contracts govern implementation. Historical prompt wording never overrides them.
