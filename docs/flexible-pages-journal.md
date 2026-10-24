---
provenance: "Unvetted Synthetic"
---

# Flexible pages and journal correction

The developer's 2026-10-24 coordinator instruction supersedes the fixed Today, Patterns, About me, personal/medical page types, fixed observation metrics, and separate day-plan records in earlier designs. This brief records the requested behavior and proposed minimal contract. It does not claim implementation is complete.

## Requested experience

The app has a simple sidebar with user-created pages and one fixed Journal database. People can add and rename pages for whatever matters to them. Personal needs and medical needs are examples of content, not required page types or navigation destinations.

Every journal row has parameters and an editable page body. Parameters are flexible properties appropriate to the person's needs. A day plan is a heading and ordinary content within that entry's page body, including paragraphs, lists, or checkboxes. It is not a separate database table, plan resource, or mandatory structured questionnaire.

Example: a person creates "What helps me" and "What I want to track" pages. The latter asks to track sleep and nausea. A voice check-in creates a Journal row with those properties and a page containing the person's note and a Day plan section. Another person can track different properties without a database migration.

The assistant reads all of the authenticated person's context pages and tailors the conversation to their content. The app makes this context use clear when starting voice. Page content supplies facts and preferences; it does not grant permissions or override backend ownership checks. Recent journal history is a separate context source, not a reason to send every historical entry on every turn.

Most journal creation, property updates, and day-plan writing happen through the voice agent. The person can ask it to save or correct a check-in and change the plan. The app primarily provides page creation/editing, journal browsing, and direct correction of page content. It does not require a multi-stage form or separate plan-acceptance interface.

## Editor recommendation

Use [BlockNote](https://www.blocknotejs.org/) with `@blocknote/core`, `@blocknote/react`, and `@blocknote/shadcn`, matching the Lovable React/shadcn frontend. Its standard editor provides block editing; building a custom rich-text editor is unnecessary.

Persist the native block-document JSON in our backend database. Load that JSON back into the same editor for both context pages and journal-entry bodies. Produce readable text for model context from the saved blocks. JSON is the authoritative content; derived text is not an independent editable copy.

Official documentation inspected through Context7 describes `editor.document` for saving blocks and `initialContent` for loading them. It describes Markdown export as lossy, so Markdown should not replace the JSON document for persistence. The frontend owner must verify the selected package version, React/TanStack compatibility, client-side editor mounting, and the exact supported block schema before integration. Advanced collaboration or paid editor extensions are not needed for this request.

## Minimal application records

- Context page: ID, authenticated owner, title, block `content`, revision, and timestamps. The page's purpose comes from its content rather than a fixed `kind` enum.
- Journal entry: ID, authenticated owner, title, local journal date, flexible `properties`, block `content`, original selected user text, capture/session ID, operation ID, context revisions, revision, and timestamps.
- Check-in session: existing backend workflow and draft state used to prepare, confirm, and save a journal entry exactly once.

Keep existing authentication and per-user ownership. A property map can store simple text, number, boolean, null, and list values as JSON. Define its allowed value types and bounded size in one shared validator. Missing values remain absent. Use stable property names across entries; the journal view can derive visible columns from stored properties without requiring a new database-definition product.

The day plan belongs only in the journal entry's content. Fixed mood/energy/symptom columns and an observations table are not prerequisites for this flexible journal. Existing legacy records must be preserved or migrated explicitly; do not delete development data merely to simplify the new schema.

## Proposed API alignment

Reuse the current authenticated API and workflow owners. These are intended interfaces for backend reconciliation, not routes verified as implemented:

- List/read/create/update context pages, with arbitrary titles and the shared block content format.
- `GET /api/v1/context` returns all owned context pages and their revisions, with explicit handling if bounded context cannot include them all. It must not silently omit a page because of a fixed personal/medical category.
- List/read/update Journal entries with `properties` and `content`. Updates require the expected revision and preserve fields omitted from the update.
- Existing check-in draft/save operations carry a generic journal draft. Remove the requirement for fixed observations or `proposed_plan.items`; the plan is part of content.
- Voice tools expose context retrieval, draft preparation, confirmed journal save, and revision-checked entry updates through the same application services as the app.

A spoken save still requires the person's explicit confirmation of the current draft. Keep backend revision checks, idempotent operation IDs, owner validation, and transaction boundaries. The agent announces success only after the database confirms it. A failed write retains the draft. A repeated save returns the same entry. An outdated page edit returns a revision conflict instead of overwriting newer writing.

Changing a day plan means updating the relevant journal page content after confirmation, preserving the rest of the page. The user need not manage a separate plan status or acceptance record. Model instructions should follow needs in the user's pages instead of forcing a fixed question order or hardcoded fatigue metrics.

## Current implementation gaps

Code inspected in the coordinator thread on 2026-10-24 still differs materially:

- `backend/packages/db/src/schema/journal.ts` restricts context pages to `personal_needs` and `medical_needs`, stores fixed observations separately, and has a `day_plans` table.
- `backend/apps/server/src/domain/contracts.ts` accepts only text/checklist sections and four fixed observation metrics; draft plans use a separate structured object.
- `backend/apps/server/src/routes/journal.ts` exposes page PATCH but no page creation route and no saved journal PATCH route.
- `backend/apps/server/src/routes/voice.ts` exposes only context/check-in reads and draft preparation. Its agent cannot confirm, save, or update a journal entry.
- `backend/apps/server/src/voice/prompts.ts` directs a fixed questionnaire and says the person must save in the app.
- The canonical Lovable testing project contains a static scaffold only. No integrated page editor or journal workflow has been established.

The existing foundation's tests verify its earlier contract. They do not establish compliance with this correction.

## Ownership and verification

The coordinator owns this correction brief and reconciliation. The existing backend owner retains schema, migrations, API, workflow, and prompt implementation. The PRD/API thread reconciles the broader documents. The device thread adapts voice/bridge instructions. One Lovable writer owns frontend changes in testing project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5` in Jonas' workspace; do not create a competing backend or Lovable database.

Verify adding an arbitrarily named context page, saving editor blocks and reloading them, tailoring a check-in to that page, saving a Journal row with unfamiliar properties, and editing a Day plan section inside its body. Verify duplicate-save handling, stale-revision protection, and foreign-user access with the new contract. Actual Atech audio remains a separate required integration check.
