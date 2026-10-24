---
provenance: "Unvetted Synthetic"
---

# Today-first implementation plan

The user accepted the [written design](superpowers/specs/2026-10-24-today-first-companion-design.md) on 2026-10-24. This is an implementation handoff, not evidence of a working app. Use the [PRD](../PRD.md), [shared contracts](app-structure.md), and [API readiness findings](api-readiness.md) together. This plan preserves required Atech voice; the typed path is an independent integration milestone, not a replacement.

Testing is authorized in Lovable workspace `lM5BSCDhedvBnbbUoDgS` / Jonas' Lovable. The canonical dedicated sandbox is [Pink Hack Integration Testing](https://lovable.dev/projects/ee916e8c-7f2f-4989-9c6e-cedcff1793b5), project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5`, verified through MCP at revision `369b6384898a390feaa381aca4ee246141901bb0`. It is a ready static scaffold, unpublished with its database disabled. Reuse it and read the current files before integration; do not duplicate project creation. Original test project `1c721b93-c6e1-407b-a22d-91efc06d322b` and initial sandbox `fafa377f-6764-4ee1-850b-5870277f3ed4` belong to Klara's workspace and are not integration targets. A production/build-project choice has not been supplied.

Event deadlines are 15:00 check-in and 16:30 working demo on 2026-10-24, treated as Europe/Copenhagen. Keep submission state and the verified demo candidate in [status](../status.md). Do not infer a scope cut from the remaining time.

## Ownership and execution order

The existing backend scaffold thread owns local backend code, dependencies, database setup, and runnable probes. Do not duplicate its work. Use one writer for the Lovable project and its shared configuration. App and backend specialists may prepare independent work, but sequence their remote edits through that writer. Local device-bridge work and readiness research can advance independently. Except for the existing backend owner and testing-sandbox provisioning worker, these are proposed roles rather than new implementation assignments.

- App owner: actual components, navigation, writing, draft review, charts, and accessible interaction.
- API/storage owner: schemas, authentication, persistence, revisions, confirmed writes, and pattern queries.
- Voice/device owner: GPT-Live lifecycle, application-tool execution, real Atech audio and indicators.
- Integrator: contract reconciliation, remote mutation coordination, full demo verification, and submission evidence.

Begin the app path with tasks 1–3. AI and charts then consume the same persisted records. Voice readiness runs alongside app development after preflight; device integration joins after authentication and tool contracts exist. Do not duplicate account inspection or validation already performed unless the relevant state has changed.

## 1. Verify the target and prepare one shared contract

Owner: integrator with API/storage owner. Dependencies: testing workspace and working Lovable MCP access.

Read the selected Lovable project's actual files and current revision. Confirm workspace membership, who else is editing, package scripts, and frontend conventions. Reuse its TanStack Start, React, Tailwind, and shadcn/Radix scaffold. The coordinated architecture is Lovable frontend plus the existing Better-T-Stack backend, not a second app-owned backend. Verify the public API base URL, exact allowed frontend origins, and credential/cookie behavior across that boundary.

Reuse backend domain schemas in `backend/apps/server/src/domain/contracts.ts` and expose the same contract to the frontend; do not maintain divergent schemas. Read the latest code first because the backend owner is actively editing it. Include original text, local date and UTC timestamps, owned context revisions, confirmed observations, stable plan-item IDs, expected revisions, and stable operation IDs. Energy is a labeled 1–5 self-report consistently across input, extraction review, storage, and charts. Do not persist the mockup's three-category illustration. Select and record the exact labels once before dependent UI work. At this review, the backend validator still accepts `low`, `moderate`, and `high`; its owner must reconcile that with the approved numeric scale before dependent capture/chart work. Do not reinterpret already recorded categories as numeric values without an explicit migration decision.

The shared contract now includes profile initialization/settings, check-in extraction, independent plan creation/generation, and Today plan retrieval. Freeze names and payloads sufficiently for consumers, then evolve them through explicit coordinated changes. Verified backend scripts are `pnpm run check-types`, `pnpm run test`, and `pnpm run build` from `backend/`. They are planned verification commands, not checks run in this design thread. Inspect the actual Lovable project for its frontend scripts.

Completion evidence: target workspace/project/revision recorded, one agreed schema set, no unintended edits to teammate work, and an identified project writer.

## 2. Establish authentication and durable storage

Owner: API/storage owner. Dependencies: task 1.

Extend the existing local backend through its owner. Its README/manifests identify Hono/Node, Drizzle with SQLite/libSQL, Better Auth, and Varlock; their runtime behavior has not been verified here. Existing schema work is under `backend/packages/db/src/schema/`, auth under `backend/packages/auth/src/`, and routes/domain logic under `backend/apps/server/src/`. Use that backend's migration and environment conventions; do not provision Lovable Cloud as a competing source of truth. Complete or adapt the shared tables for profiles, personal/medical context pages, journal entries, observations, day plans, check-in sessions, and device ownership when needed. Keep observations and plans separate from journal writing; plan items can remain a bounded structured array.

Implement idempotent profile initialization, context reads/edits, check-in creation/draft/cancel, revision-bound confirmation, atomic commit, journal reads/edits, and plan draft/accept operations. Writes derive the owner from authentication. Foreign-owned IDs never select another user's data. Context GET is read-only; initialization creates the profile and empty pages explicitly.

Completion evidence: a signed-in test user saves context and an entry, reload retrieves them, a second user cannot retrieve or modify them, repeated commit returns the same entry, and stale revisions preserve saved data. Focused integration tests should exercise these invariants, including transaction rollback if one dependent write fails.

## 3. Build a complete manual typed workflow

Owner: app owner through the Lovable project writer. Dependencies: task 2; layout work may start after schemas are stable.

Use actual shadcn/Radix components and semantic theme tokens in the selected Lovable app. Connect its frontend to the shared backend API with authenticated requests, visible connection failures, and exact-origin CORS settings. Primary navigation is Today, Journal, Patterns, and About me. Place personal and medical context pages under About me; assistant and settings controls are secondary. Implement the approved warm, spacious visual direction as a coherent theme rather than separate inline styles.

Build Today capture, optional explicit observations, a manually editable plan, review, confirmation, commit, and reopening the journal. Permit an empty context and missing observations. Keep original writing visible alongside the editable note. Show real unsaved/saving/saved/failed states and retain the draft on error. Accepting a plan and completing its activities remain different actions.

Completion evidence: a new synthetic scenario completes writing, correction, priority editing, save, refresh, and reopening through the real backend. Verify keyboard use and mobile layout. This is a real manual mode; it must never pretend to have performed AI extraction or a voice conversation.

## 4. Add reviewed AI extraction and grounded plan drafting

Owner: API/storage owner for server integration; app owner for review UI. Dependencies: task 3 and usable credentials in the trusted runtime.

Author self-contained production instructions following the prompting skill when implementing the model calls. Extraction receives a specific entry revision and emits source-linked suggestions. It cannot invent sleep duration, clinical scores, or missing observations. The UI lets the person edit or reject each suggestion. Only reviewed observations enter Patterns.

Generate an editable plan from confirmed observations, current priorities, and permitted personal/medical context. Cite the relevant user statement in suggestion rationale. Preserve existing care-team instructions without inventing treatment advice. Allow smaller alternatives, deferral, or rejection; do not invent appointment times or silently replace an accepted plan.

Use the independent day-plan generation operation when writing has already been saved. A terminal saved check-in is not reopened to perform AI work. Check source and plan revisions before applying results; a late result cannot replace newer edits. AI failure leaves persisted writing intact and manual planning available.

Completion evidence: unfamiliar low-energy and conflicting-priority examples produce reviewable suggestions, "slept badly" produces no invented hours, rejection removes a suggestion, and model failure or stale output preserves existing records. Verify real model access separately from merely storing a credential.

## 5. Build evidence-linked Journal and Patterns

Owner: app owner with API/storage owner. Dependencies: confirmed persisted observations from tasks 2–3; AI is not required for chart correctness.

Implement dated journal rows that open readable entries, multiple entries per day, and optional reflection. Pattern queries return only owned confirmed observations with source IDs and actual timestamps. Show consistent energy labels, recorded-day coverage, visible gaps, and a text alternative to charts. Do not silently aggregate multiple same-day entries.

Observation edits update charts and retain source provenance. Removing an entry removes its points and marks dependent plan suggestions for review. The accepted plan is not regenerated automatically. Use empty states for zero observations and a single observation without claiming a trend.

Completion evidence: tap and keyboard-select a point to open the correct source, correct an observation and see the chart change, verify multiple check-ins on one day, and verify gaps and deletions. Use real saved test entries; historical demonstration fixtures require explicit approval and labeling.

## 6. Verify GPT-Live and the real Atech audio path

Owner: voice/device owner. Dependencies: task 1 for workspace/runtime choices; stable authenticated tool contracts from task 2 for persistence integration.

First verify direct OpenAI project access in the intended trusted runtime. Arrange credentials through its private secret configuration; never put keys in chat, browser variables, firmware, or logs. Verify voice-model and delegated reasoning-model access independently. An access-only test establishes startup and clean close, not audio or storage.

Confirm the exact starter-kit board, modules, ports, firmware, audio formats, and transport authorization before firmware work. Follow Atech's actual supported workflow. If Uno Q deployment becomes relevant, follow `/Users/j/summer-uno-q/SKILL.md` and its board scripts exactly; do not invent adb or docker commands.

Choose a laptop/native bridge only after verifying the available audio transport. The documented primary Live WebSocket can use 16 kHz PCM input/output, but matching format names alone does not establish compatible capture, framing, throughput, pacing, or playback. Verify ordered capture, bounded playback, interruption, and echo behavior. Use one authenticated tool executor even when multiple clients receive events.

Route real Atech microphone input and returned speaker audio through the selected Live transport. Use the same check-in, context, confirmation, and commit operations as the app. A reconnect resumes authoritative workflow state; duplicate tool calls do not duplicate writes. Drive indicators from actual connection/capture/playback state. A browser microphone test is useful isolation evidence, but does not satisfy Atech voice acceptance.

Completion evidence: actual device speech creates a reviewed entry, the API confirms one save, the speaker announces success, the app retrieves the same record, interruption stops stale playback, and session close returns terminal usage. Record tested hardware, runtime, and project revisions. No Atech bonus claim before this evidence.

## 7. Integrate and verify the submitted demo path

Owner: integrator. Dependencies: completed app workflow and required voice/device outcomes.

Exercise an unfamiliar synthetic personal/medical scenario through context, Atech input, draft review, correction, plan choice, confirmation, stored entry, and app reload. Then run focused negative checks: cancel causes no journal commit; replay creates one entry; reconnect preserves the draft; stale revision conflicts preserve changes; foreign-owner access fails; model/storage failures report the correct state.

Run the selected project's actual type, lint, and build checks in proportion to the changed code. Those checks supplement real workflow verification. Record the passing candidate revision, environment, public demo link when published, and remaining limitations in status. Recheck only after changes, failures, or a concrete concern.

Rehearse a pitch within three minutes around the user's problem, the check-in, a smaller chosen plan, persistence, and a source-backed pattern. Claims and any fixture labels must match the demonstrated candidate. Prepare a recording of that candidate as a fallback and verify the submitted link. Submission and publishing require their own authorized action, not a claim inferred from this plan.

## Current dependencies and handoff

The design review is complete and testing workspace is specified. Project membership/build selection, actual implementation-tool access in the writer's session, database/auth setup, direct OpenAI project access, and hardware inventory remain concrete preflight inputs. They do not prevent planning or independent work that does not depend on them.

This document assigns no additional implementation writer, requests or tests no credentials, and changes no remote app or database. Existing backend and sandbox work belongs to its recorded owners. Use the tasks above to brief the relevant owners once the destination and current project state are verified. Keep scope changes with the developer and preserve the PRD's required device outcome.
