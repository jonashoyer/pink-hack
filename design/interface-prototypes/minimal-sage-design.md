# Minimal Airy Sage: web and phone app prototypes

## Direction

The user likes Airy Sage and the symptom-first direction, and now requests an even simpler interface with both web and app versions. These visual prototypes retain the original Airy Sage as their style reference. They do not create a functioning web or native mobile application.

## What becomes simpler

- Show one symptom chart at a time, selected with Fatigue / Nausea / Pain text tabs. These are example tracked symptoms, not mandatory categories.
- Show one current rating and its five-day point change, without separate statistic cards.
- Replace the daily record table with a single recent-note link. Detailed notes belong in Journal.
- Use thin separators and typography rather than nested panels, shadows, or large floating voice bars.
- Keep one compact primary action: Record a note.
- Preserve a visible scale, dates, and labels for the trend. Minimalism must not hide what the numbers mean.

## Web

A quiet sage sidebar contains Symptoms, Journal, and user-created context pages. A centered writing-width workspace contains the selected symptom, chart, and recent note. Journal remains a separate destination using the existing editable block content.

## Phone app

The phone design is composed for touch, with Symptoms, Journal, and Pages in bottom navigation. It has no desktop sidebar. The Symptoms screen shows the same selected symptom and period as the web concept. The Journal screen shows the daily note, its symptom values, a link to trends, and earlier notes. Keep controls at least 44px, respect safe areas, and provide a scrollable content region above the bottom navigation.

The mockups describe a mobile app experience. Native packaging versus an installable web app remains a platform implementation choice; neither is implemented or verified by these images. Both clients should share the existing backend and authenticated user data. Verify the existing authentication and audio lifecycle on the chosen mobile platform before promising feature parity.

## Repository alignment

Reuse Jonas's existing Lovable frontend work, Hono/Turso services, Journal entries and flexible properties, BlockNote content, and direct voice-writing flow. Keep the symptom scale, missing-data, aggregation, and transcript constraints from [the symptom-first notes](symptom-first-design.md). Numeric chart data must be explicitly reported, not invented from qualitative notes. Journal copy says 'note' rather than 'transcript' until actual transcript capture is established.

Illustrative five-day fatigue values are 6, 5, 4, 4, 3 for Oct 20–24, 2026, on a 0–10 severity scale where lower means less severe. The endpoint change is 3 points lower. Nausea and pain data remain as specified in the symptom-first notes. A chart implementation must use the recorded numeric values; generated artwork is visual guidance, not an authoritative plot.

## Delivery and review

Built-in image generation produces the desktop visual and a two-screen phone board. Prompts are stored alongside them. Logo and product name remain provisional. No live Lovable, backend, or deployment changes are made. This revision is proposed for review; the user has selected Airy Sage as inspiration, not yet this particular reduced layout.
