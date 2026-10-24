# Here With You — final visual prototype

This is the consolidated visual handoff for the user's selected direction. It contains image prototypes, not an implemented web frontend, native app, or deployment.

## Selected by the user

- Name: **Here With You**.
- Logo: **B — A listening line**, the rounded speech outline and voice strokes in [the selected reference](selected-logo-reference.png). This supersedes all provisional page marks and unselected concepts.
- Visual inspiration: original Airy Sage, refined to warm white, pale sage, forest gray-green, and desaturated chart tones. Generous spacing, restrained typography, minimal panels.
- Primary navigation: **Home / Journal / Symptom**, on both phone and web.

## Screens

- **Home:** daily starting point, Record a note, today's note preview, links to Journal and symptom trends.
- **Journal:** editable date-ordered daily notes, their source and saved state when real data is connected, and access to the related symptom view. Do not label an agent-written note a verbatim transcript without actual speech capture.
- **Symptom:** individual tracked symptoms and All together in a single chart, default five-day period, readable shared severity scale and legend. Phone uses a compact selector; desktop uses text tabs.

The phone board shows all three screens. Separate desktop images show Home, Journal, and Symptom at readable size. Final screens use the selected listening-line identity; the source logo sheet is retained for refinement. Image-generated small branding is visual guidance; the selected source takes precedence if any rendering differs. Production requires exact editable logo assets and small-size checks.

Deliverables: [phone app](app.png), [web Home](web-home.png), [web Journal](web-journal.png), and [web Symptom](web-symptom.png).

Latest requested revision: [daily overall health rating](daily-rating/README.md) adds a separate self-reported 1–10 daily rating across the full prototype. Use that revision for the current design; the files here remain the preceding version for comparison.

## Data and repository alignment

All displayed content is fictional. Example symptoms: fatigue, nausea, pain, appetite loss, and sleep difficulty, each explicitly self-reported on the same 0–10 severity scale. Lower means less severe. All overlays separate observations; it never computes a composite health score. Retain prior [symptom data and integrity rules](../interface-prototypes/all-symptoms-and-identity.md) and [transcript/aggregation requirements](../interface-prototypes/symptom-first-design.md).

Implementation should use Jonas's existing Lovable work, authenticated Hono API, Turso storage, Journal flexible properties, native BlockNote content, and direct voice-writing behavior. Missing ratings remain missing. Dates follow the user's local calendar. Numeric observations come from explicit ratings. Preserve context records even though Pages is absent from primary navigation. No competing backend or database.

## Verification boundary

The final generated images are inspected for navigation, chosen branding, content hierarchy, chart labels, and palette. These are static visual prototypes; interaction, accessibility, microphone capture, native packaging, API wiring, exact logo geometry, and chart numeric accuracy require implementation verification. The generated chart is not an authoritative scientific plot. No live Lovable changes, commits, or deployment are performed by this handoff.

Generation uses the built-in image tool. Exact prompts are stored in this directory alongside the deliverables.
