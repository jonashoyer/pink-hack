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
- Corrected Azure `gpt-live-1` access probe passed from the root `.env`: real `session.started`, graceful `session.closed`, reason `close_requested`, WebSocket code 1000, final usage 0.0 seconds. The earlier Realtime rejection was the wrong protocol and is superseded as a Live blocker. Audio, tools, Atech, and full app integration remain unverified by this probe. See [API readiness](docs/api-readiness.md).

## Approved design direction

- Hosting correction: use existing [Vercel project](https://vercel.com/quasr/pink-hack) for the app backend and existing Turso for storage. Azure remains the Live provider. The previously allocated Azure VM URL is superseded as the API target; its earlier smoke checks are historical evidence only. Backend owner must supply a verified Vercel runtime origin and establish WSS/audio relay support before same-service device claims.
- Storage correction: the developer supplied `DATABASE_URL` and `DATABASE_API_KEY` in root `.env` and selected Turso as the sole deployed database. Backend owner configures that existing database and verifies persistence; a new cleanup agent identifies/removes this project's obsolete non-Turso deployed database only. Application service and device relay deployment remain required. No credentials are recorded here.
- Latest direction is direct voice-agent Journal writing. Use [flexible pages and journal correction](docs/flexible-pages-journal.md): arbitrary context pages, all owned pages used by the assistant, one Journal with flexible properties and BlockNote content, and day plans inside that body. `POST /journal` and revision-checked `PATCH /journal/:id` write directly on the user's request, with no mandatory held proposal, confirmation receipt, staged check-in, or review screen. Owned voice-session identity replaces a check-in prerequisite. Legacy check-in data/routes are preserved but not required. Existing Turso remains sole deployed storage. Backend/frontend/device owners are aligning the direct-write path; earlier tests do not prove it.
- The developer selected planning today around fatigue and personal priorities as the first demo outcome, and approved Today with Journal, Patterns, and About me supporting it.
- The developer explicitly confirmed our app's backend for storage, with no Notion integration. The latest request requires personal-needs pages, medical-needs pages, journal database entries, and Atech voice connected to the same API as the app.
- The developer reviewed and accepted the [Today-first design spec](docs/superpowers/specs/2026-10-24-today-first-companion-design.md). It includes a saved interactive mockup with illustrative data, reviewed at desktop and mobile widths. The [implementation plan](docs/implementation-plan.md) now records task ownership, sequence, shared contracts, and acceptance evidence. This is planning/design evidence, not a verified app or demo candidate.
- Canonical testing target is [Pink Hack Integration Testing](https://lovable.dev/projects/ee916e8c-7f2f-4989-9c6e-cedcff1793b5), project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5` in authorized workspace `lM5BSCDhedvBnbbUoDgS` / Jonas' Lovable. [Preview](https://id-preview--ee916e8c-7f2f-4989-9c6e-cedcff1793b5.lovable.app). Corrective remix verified through MCP at revision `369b6384898a390feaa381aca4ee246141901bb0`: ready, no runtime error, unpublished, database disabled, landing-page source identical to the initial scaffold. No separate build or workflow test was run. The Klara sandbox is retained but is not the integration target.
- The PRD reconciles that design with the latest API and Atech requirements. Personal and medical needs sit under About me; confirmed observations and accepted plans remain separate records. A laptop Atech audio bridge is proposed, not verified.
- Backend foundation is implemented in `backend/`: Hono/Node, Better Auth, Drizzle SQLite/libSQL, authenticated pages and journal workflow, Azure/direct OpenAI Live session adapters, and a reusable browser client. Backend owner verified twelve synthetic-data tests, type checks, production build, migration application and local HTTP health/unauthenticated access. Full Lovable/Atech integration remains pending. See [backend setup and coverage](docs/backend.md).

## Work outcomes

| Outcome | Owner | State | Evidence or dependency |
| --- | --- | --- | --- |
| Turso cutover and obsolete database cleanup | Backend owner + coordinator's cleanup worker | Cleanup complete; production persistence verified by backend owner | No obsolete hosted DB existed, so nothing was deleted. Vercel/Turso direct Journal POST, reload, PATCH, retry/conflict and stale-revision checks passed in backend owner's production test |
| PRD and full app structure | PRD main thread | Draft delivered; document checks passed | Routes, records, shared API, and acceptance documented; links/fences checked; architecture interaction passed at 728px and 360px |
| GPT-Live readiness | Delegated API researcher + PRD main thread | Documentation checked; Azure access passed | Real startup/close confirmed `gpt-live-1`; audio, delegated tools, and device remain pending |
| Root .env API access probe | PRD main thread | Corrected Azure Live probe passed | One Live session started/closed in 1.49s, usage 0.0s; no audio/tools/writes. Earlier Realtime failure superseded. Existing claude-impact-lab adapter paths and sanitized result sent to backend owner |
| Backend/API/storage and client | Backend scaffold thread | Production deployed and direct writes verified | `https://pink-hack.vercel.app`, deployment `dpl_Ak43VzrcBBiwjuD27reY4y6e4WNF`; owner reports health 200, unauthenticated 401, Better Auth and Turso direct-write/reload/retry/revision checks passed. Frozen voice client/callback supplied to frontend; actual authenticated audio pending |
| Lovable frontend implementation | Coordinator's sole Lovable frontend worker | Direct-entry revision `c89d20ed854840a37f31cf735df34329adcc4279` ready; integration handoff pending | Writer reports 79 focused tests/build/internal editing/mobile checks; diff/source review in progress. New entry uses direct Journal POST, PATCH preserves creation metadata, and no staged-check-in UI/methods are required. Normal editor memory/retry IDs retained. No active remote mutation; operator host blank awaiting verified Vercel routes and revised voice/client/agent signatures |
| Dedicated Lovable testing sandbox | Coordinator's Lovable provisioning worker | Provisioned and workspace verified | Canonical project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5` in Jonas' workspace; MCP ready/source verification at `369b6384898a390feaa381aca4ee246141901bb0`; static scaffold only |
| Atech voice integration | Unassigned | Not started | Exact hardware, audio transport, gateway identity, and pairing needed |

## Next outcomes

Frontend integration handoff is ready: backend owner verified production `https://pink-hack.vercel.app` at deployment `dpl_Ak43VzrcBBiwjuD27reY4y6e4WNF`, including Better Auth, Turso direct writes/reload and retry/revision protections. CORS/trusted auth for `http://localhost:8080` and the canonical Lovable preview passed. Sole frontend writer received fixed host, frozen optional-entry/owned-voice-session client, direct agent callback and bounds, and is connecting them in one sequential mutation. `@backend/client` is private; copy its framework-independent source modules. Public browser app workflows and authenticated audio still need verification. Unauthenticated WSS 401 alone does not establish working device audio. No duplicate paid startup or singleton provisioning is required.

1. Use canonical sandbox `ee916e8c-7f2f-4989-9c6e-cedcff1793b5` for integration testing; provisioning and workspace verification are complete. This is a testing destination; the production/submission destination is not established by that request. Confirm the Atech starter kit's exact modules and track ownership before firmware work.
2. Use the accepted Today-first spec and implementation plan. Validate the exact audience; the source's tracker wording remains unresolved, and the approved direction does not require clinical readiness scoring.
3. Backend owner builds from PRD.md and docs/app-structure.md using Better-T-Stack; Lovable frontend consumes that API. Integrate the verified root-file Azure Live settings and adapt the existing claude-impact-lab voice transport. Coordinate voice/hardware ownership and test real audio/tools/persistence through the shared API.
4. Exercise a complete real check-in through input, stored output, user review, and the proposed day plan. Record the passing revision and environment as the demo candidate.
5. Prepare project name, team names, truthful problem/solution statements, demo link, and bonus answers for the 15:00 check-in. Submission status is unknown.
6. Verify the final demo link, rehearse a three-minute pitch, and record a fallback of the demonstrated workflow before presentation.

These are pending outcomes, not claims of completed implementation. No scope cuts or substitute mocks have been approved.

## Design-to-backend handoff

- Backend energy validation now matches the accepted integer 1-to-5 self-report. Shared `energyLabels` are 1 Very low, 2 Low, 3 Moderate, 4 High, 5 Very high. New writes reject text categories; no existing categories were converted automatically.
- Shared contracts now explicitly describe profile initialization, extraction, independent plan creation/generation after a journal save, and Today plan retrieval. Backend owner should compare these with active implementation; saved check-ins remain terminal, and AI failure must not invalidate saved writing.
- The implementation plan reuses the current Hono/Node, Drizzle/SQLite, Better Auth, and Varlock scaffold and leaves backend mutation/probe ownership with its existing thread. No implementation tests were run by the design thread.

## Obsolete hosted database cleanup

- Read-only cleanup inventory on 2026-10-24 found no separate non-Turso database to delete. Azure CLI `az resource list --resource-group rg-pink-hack-demo` returned exactly six resources in subscription `271af4b8-0dc1-46d0-b64b-31cc1676c3b8`: app VM `pink-hack-demo`, OS disk `pink-hack-demo_OsDisk_1_e1d60748b41c4da9904910068963a8d3`, public IP, NSG, virtual network, and NIC. No database service appeared. `az vm show` confirmed that disk is the app VM's OS disk and there are no data disks. All resources were preserved.
- Lovable MCP `get_database_status` returned `enabled: false` for the canonical project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5`, retained sandbox `fafa377f-6764-4ee1-850b-5870277f3ed4`, and original test project `1c721b93-c6e1-407b-a22d-91efc06d322b`.
- Backend owner `dac033a2-a1c4-48ee-a7cb-39cb86afe1a7` confirmed no separate hosted database was created and reported the VM's planned SQLite directory is still empty. Cleanup made no provider mutations, accessed no credentials, and deleted no data or files. Turso configuration, migrations, deployed service cutover, and remote persistence verification remain the backend owner's work; this cleanup does not establish their completion.
