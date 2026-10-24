# Apply the approved design to the existing Lovable frontend

Use [the approved design](README.md) and its four screenshots, selected logo, and theme tokens. This file is a migration checklist for the external frontend, not another visual specification. Repo cleanup and live frontend implementation are separate operations.

## Locate the existing project

The repo records project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5`. The public badge currently links to editor identifier `lovp_38x1yketxc9gkr88f8712w6y2g`. Do not assume these are different sites or identical projects without owner verification. Both connector lookups returned `404 project_not_found` to the current connection. Open the project that actually publishes `pink-hack-journal.lovable.app` with an authorized account, then confirm its code repository/branch and publication settings.

## Update in place

1. Inspect the existing route tree, theme, components, BlockNote integration, and voice client. Keep current API behavior and existing data. Do not create a second frontend or enable another database.
2. Reuse one app shell and shared components: brand header, desktop navigation, mobile navigation, daily rating, note preview/editor, and symptom chart. Import/map `theme.css` to the existing shadcn setup, respecting its colour-variable format. Do not paste full hex values into a theme that expects HSL channels without adapting the format.
3. Replace visible Pink Hack product branding and metadata with Here With You and the selected listening-line logo on `/` and `/app`. Keep real infrastructure names, backend URLs, and project IDs unchanged. Produce small-size logo assets from the selected source without the presentation-sheet captions; verify light/dark and 24px/48px versions.
4. Keep the public landing at `/`, use the same identity and tokens there, and retain its Open app/demo link to `/app`. The approved screenshots prescribe the app, not a new landing layout. Replace obsolete marketing emphasis on Pages with approved features: spoken notes, daily ratings, and symptom trends. Avoid unverified health or voice claims.
5. Make `/app` open Home. Journal and Symptom are destinations within that same frontend. Proposed child paths `/app/journal` and `/app/symptom` need matching router entries or equivalent tab state; do not advertise nonexistent URLs. Preserve or redirect existing links as needed. Desktop sidebar and phone bottom tabs use the same three labels and active destination.
6. Keep context-page records and editing functionality under secondary settings. Keep BlockNote JSON authoritative. Journal notes may be editable summaries; label text a transcript only when verbatim captured speech actually exists.
7. Bind ratings and graphs to real Journal observations only after agreeing on stable symptom keys/scale metadata and one daily-health source of truth. Show Not rated and Not recorded for absent values. Implement the shared scale/date/data rules in the approved spec. Never populate a missing rating with the illustrative 7/10.
8. Use the existing fixed-user Hono API at `https://pink-hack.vercel.app`, existing Turso database, and current Stop/retry-aware voice client. No browser account credentials, owner selectors, provider keys, or database secrets. Preserve revision checks, operation IDs, save-error recovery, and stopped state.

## Verify before publication

- Inspect `/` and `/app` on desktop and phone: same Here With You brand, selected logo, tokens, and exactly Home / Journal / Symptom primary destinations. No duplicate Pages/Today/Patterns app shell or unused alternate themes.
- Navigate all destinations, direct links, and browser back/forward; verify mobile safe areas, 44px targets, keyboard access, contrast, and no clipped chart legend or obscured controls.
- Confirm the same daily rating/date across views; record/edit/reload an explicit rating. Verify missing ratings, multiple notes in a day, revision conflicts, and identical retries with the existing services. Any contract extension must be implemented and tested, not mocked as saved.
- Verify All and individual chart views, scale directions, pagination, missing-day gaps, and explicit source observations. Do not merge the overall health rating into the symptom scale.
- Recheck BlockNote save/reload, preserved context/day-plan blocks, and actual microphone/Stop/retry behavior. The audited public page displayed Server unavailable and disabled voice; resolve that integration separately from styling.
- Capture the implemented screens and compare with the four approved images. Only then publish the updated existing project and confirm both public routes. A GitHub design-file push alone does not publish a Lovable change.

No live frontend changes or publication were performed during the repository consolidation.
