# Airy Sage revision: symptoms and daily journal

## User direction

The user prefers the Airy Sage starting point and requests a stronger focus on symptom tracking, statistics showing improvement or worsening over approximately five days, and a separate Journal tab containing daily notes/transcripts. This revises the earlier journal-first navigation. The mockups explore this request; they do not establish a deployed feature or approve a final logo/palette.

The user subsequently explicitly chose the original [C — Airy Sage](c-airy-sage.png) as the design inspiration and their favourite prototype. Use that original image as the primary visual reference when refining the symptom-first screens: pale sage sidebar, warm white canvas, forest green text and actions, restrained peach highlights, editorial headings, fine borders, and generous whitespace. The original journal-only layout is superseded by the requested Symptoms and Journal navigation. This selects the visual direction as inspiration; the exact logo, product name, tokens, and final component details remain open.

## Screens

1. **Symptoms** is the default destination. It shows a period selector, one chart per tracked symptom, today's rating, endpoint change, and dated observations linked to their source Journal entries.
2. **Journal** lists the day's entries and opens the editable daily note. Associated symptom ratings link back to the trends. Multiple entries on a day remain separate records.
3. Existing user-created context pages remain available in the sidebar. They guide the voice conversation as specified in the repository.

Retain Airy Sage's warm white, pale sage, forest green, and restrained peach accents. Use the same scale and date range across comparable symptom charts. Worsening uses a labelled terracotta treatment; direction must remain understandable without colour.

## Example dataset

All ratings and notes in the mockups are fictional. These symptoms are examples, not fixed mandatory fields.

| Local date (2026) | Fatigue | Nausea | Pain |
| --- | --- | --- | --- |
| Oct 20 | 6 | 4 | 3 |
| Oct 21 | 5 | 3 | 3 |
| Oct 22 | 4 | 3 | 4 |
| Oct 23 | 4 | 2 | 4 |
| Oct 24 | 3 | 2 | 5 |

For this example, severity is 0 = none and 10 = severe. Fatigue is 3 points lower, nausea 2 points lower, and pain 2 points higher between Oct 20 and Oct 24. The views describe reported symptoms, not overall health or treatment effectiveness. No composite health score.

## Repository integration handoff

- Keep the existing Lovable React/shadcn frontend, BlockNote editor, authenticated Hono API, Turso storage, and direct voice-writing flow. No competing application or database.
- Reuse Journal dates, flexible numeric properties, source metadata, and editable block bodies for the first tracking view where compatible with current contracts. Stable symptom identities, units, scale endpoints, and scale direction need an explicit shared representation; do not infer them from arbitrary property names.
- Numeric observations must come from an explicit user rating or direct correction. Do not convert qualitative transcript wording into an invented score.
- Scope queries to the authenticated person's selected local calendar dates. Load the full selected interval, including pagination where applicable.
- For a minimal daily chart, use the latest explicitly recorded rating per symptom per local date, expose that rule in details, and allow opening its source entry. Editing that observation recalculates the trend. Do not average silently.
- Missing observations stay missing, never zero. Break the line at missing days and show 'Not recorded'. When endpoints are missing, show 'Not enough data' for the endpoint change. Do not compare values collected on different scales as a continuous series.
- Five-day changes compare the first and last calendar day of the selected interval. Show point changes, exact dates, and a visible scale legend. Other metrics require explicit definitions before implementation.
- The current editable agent-written Journal body is not automatically a verbatim transcript. The Journal mockup's 'Voice transcript' label is valid only if verbatim recognized speech is actually captured and retained. Otherwise label it 'Daily note'. Confirm transcript storage/capture with the existing backend and voice owners; do not claim it already works.
- Preserve distinction between an original transcript and later edited notes. Show 'Edited' when applicable rather than continuing to imply unchanged verbatim speech.
- Voice remains prominent on both tabs. Saved, saving, listening, stopped, and failed states follow actual API/session responses. Existing day plans remain ordinary content inside entries.
- Responsive implementation: charts stack, the table scrolls within its container, and entries open full-width on phones. Provide textual data and keyboard-accessible chart details.

## Review state

The symptom-first structure is the requested exploration. The original Airy Sage is the user-selected visual inspiration. Final layout, logo/name, exact design tokens, tracked symptoms, and transcript capture details remain open. No remote Lovable mutation, backend change, or deployment was performed.
