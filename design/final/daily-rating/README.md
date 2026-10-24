# Here With You — daily overall health rating

This revision adds the user's requested daily overall health score to the complete app and web visual prototype. It preserves the selected listening-line logo, calm minimal Airy Sage styling, and Home / Journal / Symptom navigation.

## Rating definition

Overall health is a **self-reported daily rating**, from **1 = very poor** to **10 = very good**. The example shows **7/10 for Oct 24, 2026**. This is a design assumption for this revision, not a validated clinical measure or an automatically calculated composite of symptoms. No medical weighting or arbitrary inverse symptom average is introduced.

Symptom severity remains a separate 0–10 scale, with higher values meaning worse symptoms. Keep these direction labels visible. The overall health rating is not a sixth symptom line in the All chart.

## Placement

- Home: compact rating alongside the daily check-in, editable by the person.
- Journal: rating associated with the selected entry's local date.
- Symptom: separate daily rating row, distinct from individual symptom trends.

The complete phone board shows all three destinations. Web images show Home, Journal, and Symptom separately. Earlier prototype images remain unchanged as comparison versions.

## Implementation notes

Retain Jonas's existing authenticated API and Journal data. Use an explicit stable property such as `overall_health` only after aligning its storage and daily-date semantics with the existing owners. Bound values to integers 1–10; do not infer a number from qualitative speech. Ask for a rating or leave it missing. Show 'Not rated' when absent, never a fabricated default.

The rating is per local day. A subsequent rating for that day updates the same daily value with source/revision tracking, instead of averaging different entries silently. The implementation needs one explicit source of truth so multiple Journal entries for a date cannot disagree. Do not assume an unimplemented daily record/API exists. Preserve note content and symptom properties during updates and follow existing ownership, revision, and retry checks.

All screenshots are static generated visual prototypes with fictional data. The live app and backend have not changed, and no native build or deployment is performed. Exact generation prompts are saved alongside the images.
