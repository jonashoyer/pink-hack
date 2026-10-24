# Minimal Airy Sage: All symptoms and identity exploration

## Requested revision

Add more symptoms, add an All selector beside individual symptoms to display them together in one chart, and explore logos and product names. Retain the original Airy Sage visual inspiration and the minimal desktop/phone layouts. These remain design concepts, not live Lovable edits.

## Symptom navigation

Order: All, Fatigue, Nausea, Pain, Appetite loss, Sleep difficulty. These are illustrative user-selected symptoms; people can add or remove symptoms. On desktop use one row; on phone wrap the selectors so labels remain readable. Avoid an overflowing row with invisible options.

All shows five separate series over the same selected date range. It does not average symptoms into a health score. Individual selectors isolate a series. Use names, colours, markers, and dash styles, with accessible textual values and keyboard/touch details in implementation. Allow legend toggling to reduce clutter while keeping the All selector active.

These example measures all use self-reported severity, 0 = none and 10 = severe. Sleep difficulty is severity, not sleep hours. Only overlay compatible scales; arbitrary numeric Journal properties with different units need their own chart or explicit user-approved transformation, never silent normalization.

| Oct 2026 | Fatigue | Nausea | Pain | Appetite loss | Sleep difficulty |
| --- | --- | --- | --- | --- | --- |
| 20 | 6 | 4 | 3 | 7 | 5 |
| 21 | 5 | 3 | 3 | 6 | 4 |
| 22 | 4 | 3 | 4 | 5 | 5 |
| 23 | 4 | 2 | 4 | 4 | 3 |
| 24 | 3 | 2 | 5 | 3 | 4 |

All data is fictional. The plotted lines in generated artwork are visual guidance; implementation must plot these actual values. Keep missing-data and daily-aggregation rules from the symptom-first design. The All view has no single 'today' score because there are multiple distinct observations.

## Names and logo concepts

| Label | Name | Logo hypothesis | Trade-off |
| --- | --- | --- | --- |
| A | Dayleaf | Overlapping open pages with a leaf-like negative space; calm serif wordmark | Personal and close to Airy Sage; less explicit about voice |
| B | Daynote | Continuous speech loop resolving into a written line; humanist sans serif | Clearest link to recording daily notes; more functional |
| C | Serein | Open circular form with a short rhythm of vertical bars; refined serif | Quiet and distinctive in mood; purpose less obvious from the name |

Recommendation for exploration: Dayleaf fits the preferred visual direction; Daynote communicates the journal feature most directly. The user has selected none of these names or marks. Names are creative candidates, with no domain, app-store, or trademark availability research performed. The generated marks are exploratory bitmap artwork; refine the selected source and produce editable masters only after review.

## Repository handoff

Use the existing Lovable frontend and Journal data in Jonas's repository. New symptom choices extend the flexible-property approach rather than creating a second backend. Scale metadata, stable symptom identifiers, date rules, and observation sources need explicit implementation decisions as described in the previous notes. Journal and personal context pages remain unchanged in purpose. No diagnosis, composite health claim, or invented rating from qualitative voice notes.

## Review

Compare the new desktop and phone screens with the previous minimal versions; only the requested symptom selection and combined chart change. Compare all three logo candidates in the same board. Inspect large, compact, monochrome, light, and dark treatments before refining. Generated small icons are conceptual; production assets need exact small-size verification.
