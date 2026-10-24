---
provenance: "Unvetted Synthetic"
---

# Flexible pages and Journal implementation plan

This plan follows the developer's [flexible-pages correction](flexible-pages-journal.md), [PRD](../PRD.md), and [agreed contracts](app-structure.md). It replaces the previous Today-first plan. The goal is custom context pages, one Journal database with flexible properties and BlockNote page content, and confirmed voice creation/updates. Day plans are ordinary entry content.

## Owners and testing destination

The existing [backend thread](t3-thread://v1/dac033a2-a1c4-48ee-a7cb-39cb86afe1a7) owns backend source, dependencies, migrations, runtime, and application reasoning. The PRD/API thread owns shared contracts and reconciliation. The coordinator owns the change brief, status, and remote writer assignment. The Atech thread owns device/bridge work.

The sole [Lovable frontend worker](t3-thread://v1/thread:delegated-task:command%3Amcp%3A8d9625c7-bdd1-4672-a400-5e400f500dfb%3Adelegate-task%3Apink-flexible-pages-frontend-20261024-1) owns every remote app mutation in project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5` in Jonas' workspace. Reuse this testing sandbox; do not create another app database or project. The original Klara-workspace projects are not integration targets.

## 1. Align the existing backend

Preserve Better Auth, authenticated ownership, transaction rollback, revision conflicts, stable operation IDs, and the working Azure Live transport. Adapt storage and domain validation to generic pages and journal content/properties.

Use the existing Turso database as the sole deployed store. The backend owner loads root `.env` `DATABASE_URL` and `DATABASE_API_KEY` into private runtime configuration, maps the key to libSQL authentication, applies required migrations, and verifies preserved data plus authenticated persistence. Do not provision a database service/container. Local SQLite tests remain isolated verification, not the deployed storage choice.

Add generic page CRUD. Keep legacy context rows and migrate explicitly to the new pages table. Add native content/properties to journal records and preserve old notes/observations/plans for verified migration/audit. The active product API has no separate plan or observation resource.

Keep existing check-in draft/confirm/commit state. Add a proposal for updating an owned saved entry, bound to its expected revision. Voice commit requires a client-minted confirmation receipt for that exact proposal; the agent cannot self-confirm. New check-ins edit saved entries rather than reopening terminal sessions.

Completion evidence is new-schema tests for arbitrary titles/blocks/properties, reload, migration preservation, owner isolation, stale edits, duplicate operations, transaction rollback, confirmed create/update, and cancellation. Prior foundation tests do not prove these changes.

Verify the same invariants against configured Turso where appropriate, including retrieval after restarting the app process. A separate coordinator-assigned cleanup worker removes only this project's obsolete non-Turso deployed database and preserves the app service, existing Turso database, and data. Do not overlap that cleanup with schema or service deployment work.

## 2. Prepare the remote editor and shared client

The frontend writer reads the canonical project's current files and uses its React/TanStack/shadcn conventions. Verify a compatible standard BlockNote version with core/react/shadcn packages and client-only editor mounting.

Build a flat sidebar with Add page, user page titles, and Journal. Context pages and journal entry bodies use native BlockNote document JSON. Journal columns derive from stored properties. A plan is a heading/list in the same body. There are no mandatory fixed sections, fixed metric forms, or separate acceptance screens.

Copy/adapt the two existing framework-independent voice source files from `backend/packages/client/src/` into a local remote-app module. Do not assume `@backend/client` is published on npm. Preserve its session/model/delegation validation, microphone gating, transcript handling, cancellation, and graceful close.

The writer can prepare layout and editor behavior while routes evolve. It must not label browser-only state, fixtures, or provider connection as working persistence or a working journal agent.

## 3. Connect authenticated page and journal operations

The backend owner supplies the revised endpoint signatures, reachable API base URL, and exact allowed frontend origin. The known backend is local at `http://localhost:3000`; no verified public HTTPS URL exists yet. Resolve reachability and cookie/bearer behavior before claiming cloud integration.

Use Better Auth sign-up/sign-in and backend session credentials. Keep bearer tokens in memory and provider credentials server-side. Wire generic page list/create/edit/archive and journal list/read/edit against the agreed APIs. Preserve omitted fields and merge complete content/property edits from current revisions.

Completion evidence is a synthetic user adding unfamiliar pages, saving/reloading blocks, creating an entry with unfamiliar properties, opening the row as a page, and editing content. A second account cannot access those records. Repeat and stale requests must produce the agreed results.

## 4. Complete the application reasoning and confirmed voice flow

Azure voice uses client delegation. Implement a trusted reasoning callback that reads current owned pages/check-in state, uses relevant recent journal context, prepares generic drafts, and requests receipt-gated commits. Delegation metadata contains no task text; bounded transcript fragments require careful turn/confirmation handling and cancellation.

Use all custom pages as context with explicit size-limit handling and revision provenance. The conversation follows the user's pages rather than a fixed medical questionnaire. A proposal contains native blocks and flexible properties. A requested day plan appears inside the entry body.

The client records explicit confirmation separately from model tools. Test spoken correction, confirmation of the current revision, cancellation, interrupted confirmation, and a Day plan update preserving unrelated blocks. The assistant announces only verified persisted results.

The root `.env` Azure startup/close probe passed. Do not repeat it without a changed configuration or concrete need. Real WebRTC, microphone/speaker, reasoning/tools, and persistence still need their own tests. Missing reasoning must remain visibly unavailable, not a fabricated callback.

## 5. Join the actual Atech device

The Atech owner confirms board, modules, ports, capture/playback formats, and authenticated device binding. Its latest instruction selects one deployed demo backend with the audio relay inside the service. The backend owner publishes a fixed HTTPS origin, WSS ingress, device message contract, and PCM format. The Atech prompt connects directly to that contract; there is no laptop bridge or environment/configuration selector.

That deployed app/device-relay service connects to the existing Turso database. Its managed disk or container filesystem is not the primary database, and no database service/container is provisioned alongside it.

Follow [the firmware guide](atech-firmware-guide.md) after its device owner reconciles the new deployment instruction. That owner is also preparing separate root prompts for local PCM record/playback and the fixed deployed connection. Older bridge setup instructions are historical until reconciled.

The device/bridge uses the same context, proposal, confirmation, and commit services as the app. Verify ordered audio, bounded playback, interruption, reconnect, and genuine status indicators. A browser microphone test does not establish device audio.

If Uno Q deployment becomes relevant, follow `/Users/j/summer-uno-q/SKILL.md` and its board scripts exactly. No improvisation of adb or docker operations.

## 6. Verify the complete demo

Exercise an unfamiliar synthetic scenario: add custom context pages, start voice, use their needs, prepare unfamiliar journal properties and content, correct it, confirm a save, and reload the stored entry. Then change the Day plan inside that entry and verify unrelated blocks remain.

Check duplicate saves, stale target revisions, foreign-owner access, canceled writes, failed storage, reconnect, and interrupted confirmation. Run focused backend/frontend checks plus real product interaction. Record revision, environment, public link when established, and remaining gaps.

Atech microphone input and speaker output remain required for the device outcome. Record a fallback only from the demonstrated candidate. Follow event submission deadlines in [status](../status.md); scope cuts and publishing remain developer decisions.

## Current handoff

Backend implementation of the generic contract and authorized single app/device-relay service deployment are underway with the existing owner. Deployed storage is the existing Turso database supplied in root `.env`; its runtime mapping, migrations, and persistence evidence remain with that owner. The sole Lovable writer has the contracts and client-export strategy. The assigned cleanup worker owns only obsolete non-Turso database removal. Public app/device reachability, generic persistence, application reasoning, and actual hardware/audio require their own final evidence. No complete demo candidate is established.
