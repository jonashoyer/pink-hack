---
provenance: "Unvetted Synthetic"
---

# Pink Hack product requirements

The developer's latest instruction is a simple voice-written journal. The agent writes directly to Journal; there is no stored proposal, required draft review, or separate check-in approval workflow. This supersedes the earlier staged draft/confirm/commit design. [The coordinator brief](docs/flexible-pages-journal.md) records the correction.

## Goal

Build a Notion-style app with user-created context pages and one fixed Journal database. Each entry has flexible properties and an editable BlockNote page body. The assistant uses the person's pages to guide a conversation and writes new entries or changes existing content directly in response to their requests. A day plan is ordinary content inside the entry.

The app supports people describing their own needs, including the [event's cancer-aftercare example](docs/event-context.md). Page names, questions, and journal properties are chosen from those needs rather than fixed product categories.

Lovable is the frontend. The existing Hono/Node backend provides authenticated page and Journal operations. Hosting is the existing [Vercel Pink Hack project](https://vercel.com/quasr/pink-hack); the existing Turso database is the sole deployed storage. Azure `gpt-live-1` remains the voice provider. There is no Notion product integration or new database deployment.

## App

The sidebar lists custom pages, Add page, and Journal. Pages and entry bodies use the same standard BlockNote React/shadcn editor. Save native block JSON and reload it into that editor. Plain text for model context is derived from the saved blocks.

Journal is a table with date/title/source metadata and flexible property columns. Opening a row opens its editable body. Day-plan headings, paragraphs, and checkboxes live there, without a separate plan table or acceptance screen.

The voice agent handles writing. The user can also edit pages and journal entries directly. Normal unsaved editor text can remain locally while editing or recovering from a failed save; that is not a stored agent proposal workflow.

## Direct voice flow

1. The user starts the assistant. The backend resolves the authenticated person and owned voice session.
2. The agent reads all live owned context pages and relevant journal history.
3. It follows the conversation and the user's writing requests, creating an entry through Journal POST or updating one through Journal PATCH.
4. The backend validates the owner, content, operation ID, and expected revision, then persists the write to Turso.
5. The assistant reports the actual saved result. Later corrections are direct updates to that entry.

The agent composes tool arguments in its conversation context. It does not create a held server-side proposal or require a draft/confirm/commit sequence. It asks a conversational clarification when intent or the target entry is ambiguous.

Stopping voice prevents further actions. It does not silently undo entries already saved. Those remain ordinary editable Journal entries.

## Shared API

| Operation | Purpose |
| --- | --- |
| Page list/read/create/update/archive | User-owned custom context pages |
| Journal GET | Browse or retrieve saved entries |
| Journal POST | Create an entry directly |
| Journal PATCH | Update current content/properties directly |
| Voice session and agent callback | Audio lifecycle, context, and direct journal tools |

[Detailed contracts](docs/app-structure.md) are shared by the voice agent, app, and device integration. The agent tools are `create_journal_entry` and `update_journal_entry`, using the same services as the app. Existing check-in records/routes can remain as legacy compatibility data; they are not required by the new flow.

## Requirements

- Context pages have arbitrary titles and native BlockNote content, without mandatory page kinds.
- The assistant uses all live owned pages, tracking revisions and reporting context limits explicitly.
- Journal properties accept bounded text, finite numbers, booleans, null, or lists of those values. Missing properties remain absent.
- Day-plan edits preserve unrelated blocks and properties.
- Every write derives the owner from authentication and validates its input.
- Journal updates require the current expected revision. A stale write conflicts instead of replacing newer content.
- A stable operation ID makes retrying a write return the original result. The same ID with changed content conflicts.
- The agent announces successful saving only after a storage response confirms it.
- Failed requests report failure honestly. Conversation working text and normal local editor text can support retry without a separate proposal resource.
- Provider and Turso credentials remain server-side. Root `.env` supplies existing Turso `DATABASE_URL` and `DATABASE_API_KEY`, with token mapping verified by the backend owner.
- Preserve legacy records during the transition. Do not delete old data merely because the active API is simpler.
- The assistant organizes self-reports and planning; it does not diagnose, change treatment, or invent missing observations.

## Owners and current evidence

The [backend owner](t3-thread://v1/dac033a2-a1c4-48ee-a7cb-39cb86afe1a7) retains source, migration, runtime, and deployment work. The sole Lovable writer owns remote UI changes in canonical testing project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5`. The coordinator owns the change brief and status; this thread owns PRD/contracts reconciliation.

Azure Live access passed a real startup and graceful-close probe. Earlier backend tests covered the staged/flexible foundation and do not prove direct-write integration. [Backend documentation](docs/backend.md) records actual endpoints and evidence as its owner updates them.

The backend is moving to the existing Vercel project with Turso preserved. Previous Azure VM origins are not current frontend/device targets. A verified Vercel API URL and device WSS capability remain for the backend owner to report. The Vercel dashboard URL is not the runtime API URL.

## Acceptance

Verify adding unfamiliar context pages, saving/reloading native blocks, a page-informed voice conversation that directly creates a Journal entry with unfamiliar properties, and a direct Day-plan update preserving the rest of the page.

Verify foreign-user rejection, duplicate retry behavior, stale revision conflicts, failed-write feedback, and stop/interruption preventing subsequent actions. Real microphone/speaker and application-agent checks are distinct from access-only session startup.

Actual Atech audio remains a requested outcome. Follow [the device guide](docs/atech-firmware-guide.md) once its owner reconciles current direct-write and Vercel capabilities. Same-environment device relay support must be verified before promising WSS; a replacement hosting/bridge design is not inferred from a platform limitation.

The existing Turso database is the only deployed storage. Cleanup of obsolete non-Turso resources remains with its assigned worker, preserving the app and Turso data. A complete deployed demo candidate has not been established by this document.
