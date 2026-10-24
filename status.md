---
provenance: "Unvetted Synthetic"
---

# Hackathon status

Check-in deadline: 2026-10-24 15:00 Europe/Copenhagen.
Working demo deadline: 2026-10-24 16:30 Europe/Copenhagen.
Demo format: live from submitted link, three minutes maximum per team.
Submission: [project check-in form](https://docs.google.com/forms/d/e/1FAIpQLSeGyeJKAqK3tqfvepj_PM9ku7GWnMEvW5VbfEa91LOpUVROsg/viewform).
Freeze: none set by the developer.
Verified demo candidate: none established.

## Confirmed state

Updated during PRD and app-structure work on 2026-10-24.

- Event and product notes read. See [event context](docs/event-context.md).
- This checkout contains [PRD.md](PRD.md), [app contracts](docs/app-structure.md), an [architecture visual](docs/app-structure.html), and newly created backend files owned by the scaffold thread. This PRD thread has not verified the backend implementation or an integrated demo.
- The developer supplied a [Lovable test project](https://lovable.dev/projects/1c721b93-c6e1-407b-a22d-91efc06d322b), explicitly for testing, and an Atech starter kit. Exact board, module inventory, and port assignments remain unknown.
- Earlier browser inspection returned "You don't have access" and inspected no project contents. The developer requested Lovable MCP; subsequent MCP reads succeeded.
- Lovable MCP was registered globally in Codex at https://mcp.lovable.dev and authenticated. Read-only MCP project, file, and database-status inspection succeeded, including directly from the PRD thread.
- Lovable project "Build for impact" is ready and unpublished at inspected commit `3c3ceacb5a0a02511eea619e6df59e38203e7246`. Its UI is a blank placeholder on TanStack Start, React 19, TypeScript, Tailwind 4, and shadcn/Radix. Database is disabled, and no voice or product backend implementation was found. [Preview](https://id-preview--1c721b93-c6e1-407b-a22d-91efc06d322b.lovable.app).
- Dedicated sandbox "Pink Hack Integration Testing" was created through MCP as project `fafa377f-6764-4ee1-850b-5870277f3ed4` in workspace `6cff6cc08b0d41c2a26b` / Klara's Lovable, matching the original test project's workspace. [Editor](https://lovable.dev/projects/fafa377f-6764-4ee1-850b-5870277f3ed4) · [Preview](https://id-preview--fafa377f-6764-4ee1-850b-5870277f3ed4.lovable.app). Worker verified revision `ce43fc813db0c83f4266f5d1d1480e039ce43fdf`, ready with no build error, unpublished, and database disabled. It contains a static testing landing page only; API/storage/voice/device remain unconfigured or unverified.
- ElevenLabs and Supabase appear enabled in the workspace connector catalog. Connected credentials and working integrations were not established by that inspection.
- Existing changes to AGENTS.md and docs/gpt_live_atech_lovable_context.md belong to prior work and were preserved.
- No live audio, hardware, persistence, or deployment verification has been established. [API readiness](docs/api-readiness.md) confirms the documented `gpt-live-1` contracts; no direct OpenAI project key was found, so no live session was created. Azure credentials do not establish direct GPT-Live access.

## Approved design direction

- The developer selected planning today around fatigue and personal priorities as the first demo outcome, and approved Today with Journal, Patterns, and About me supporting it.
- The developer explicitly confirmed our app's backend for storage, with no Notion integration. The latest request requires personal-needs pages, medical-needs pages, journal database entries, and Atech voice connected to the same API as the app.
- The developer reviewed and accepted the [Today-first design spec](docs/superpowers/specs/2026-10-24-today-first-companion-design.md). It includes a saved interactive mockup with illustrative data, reviewed at desktop and mobile widths. The [implementation plan](docs/implementation-plan.md) now records task ownership, sequence, shared contracts, and acceptance evidence. This is planning/design evidence, not a verified app or demo candidate.
- Canonical testing target is [Pink Hack Integration Testing](https://lovable.dev/projects/ee916e8c-7f2f-4989-9c6e-cedcff1793b5), project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5` in authorized workspace `lM5BSCDhedvBnbbUoDgS` / Jonas' Lovable. [Preview](https://id-preview--ee916e8c-7f2f-4989-9c6e-cedcff1793b5.lovable.app). Corrective remix verified through MCP at revision `369b6384898a390feaa381aca4ee246141901bb0`: ready, no runtime error, unpublished, database disabled, landing-page source identical to the initial scaffold. No separate build or workflow test was run. The Klara sandbox is retained but is not the integration target.
- The PRD reconciles that design with the latest API and Atech requirements. Personal and medical needs sit under About me; confirmed observations and accepted plans remain separate records. A laptop Atech audio bridge is proposed, not verified.
- Backend coordination confirms a local Better-T-Stack backend with Lovable as external frontend. That thread owns backend scaffolding, dependency edits, integration, and runnable API probes. This thread owns PRD/contracts/status updates. Actual backend framework, database, and implementation evidence remain for that owner to record.

## Work outcomes

| Outcome | Owner | State | Evidence or dependency |
| --- | --- | --- | --- |
| PRD and full app structure | PRD main thread | Draft delivered; document checks passed | Routes, records, shared API, and acceptance documented; links/fences checked; architecture interaction passed at 728px and 360px |
| GPT-Live readiness | Delegated API researcher | Documentation checked; live access blocked | No direct OpenAI project key; documented startup, tools, 16 kHz PCM, and graceful close verified |
| Root .env API access probe | PRD main thread | Tested; configured Azure deployment rejected | Two documented Azure GA WebSocket attempts returned HTTP 400 `OperationNotSupported`; zero sessions or writes. Direct GPT-Live remains untested. Sanitized evidence in docs/api-readiness.md was sent to backend owner |
| Backend/API/storage and probe | Backend scaffold thread | Scaffolding reported in progress | Better-T-Stack local backend; actual implementation and private GPT-Live credential pending |
| Lovable frontend implementation | Unassigned | Not started | Confirm test/build destination and consume backend contracts |
| Dedicated Lovable testing sandbox | Coordinator's Lovable provisioning worker | Provisioned and workspace verified | Canonical project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5` in Jonas' workspace; MCP ready/source verification at `369b6384898a390feaa381aca4ee246141901bb0`; static scaffold only |
| Atech voice integration | Unassigned | Not started | Exact hardware, audio transport, gateway identity, and pairing needed |

## Next outcomes

1. Use canonical sandbox `ee916e8c-7f2f-4989-9c6e-cedcff1793b5` for integration testing; provisioning and workspace verification are complete. This is a testing destination; the production/submission destination is not established by that request. Confirm the Atech starter kit's exact modules and track ownership before firmware work.
2. Use the accepted Today-first spec and implementation plan. Validate the exact audience; the source's tracker wording remains unresolved, and the approved direction does not require clinical readiness scoring.
3. Backend owner builds from PRD.md and docs/app-structure.md using Better-T-Stack; Lovable frontend consumes that API. Coordinate voice/hardware ownership. Establish the direct OpenAI key privately in the backend runtime and test a real Live session first.
4. Exercise a complete real check-in through input, stored output, user review, and the proposed day plan. Record the passing revision and environment as the demo candidate.
5. Prepare project name, team names, truthful problem/solution statements, demo link, and bonus answers for the 15:00 check-in. Submission status is unknown.
6. Verify the final demo link, rehearse a three-minute pitch, and record a fallback of the demonstrated workflow before presentation.

These are pending outcomes, not claims of completed implementation. No scope cuts or substitute mocks have been approved.

## Design-to-backend handoff

- The accepted spec and shared documentation use a labeled 1-to-5 energy self-report. The backend validator inspected during planning still accepts `low`, `moderate`, and `high`. Backend owner must reconcile this before dependent UI/chart work; this design thread did not change backend code or existing data.
- Shared contracts now explicitly describe profile initialization, extraction, independent plan creation/generation after a journal save, and Today plan retrieval. Backend owner should compare these with active implementation; saved check-ins remain terminal, and AI failure must not invalidate saved writing.
- The implementation plan reuses the current Hono/Node, Drizzle/SQLite, Better Auth, and Varlock scaffold and leaves backend mutation/probe ownership with its existing thread. No implementation tests were run by the design thread.
