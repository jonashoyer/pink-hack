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

Reconciled during the coordinator's live agent audit on 2026-10-24.

- Event and product notes read. See [event context](docs/event-context.md).
- This checkout contains reconciled PRD/contracts and backend implementation at source `99c316c`, with verification documentation at `4d45f10`. Backend owner reports 51/51 tests, workspace types/build, production direct storage and authenticated synthetic audio passed. Complete browser/hardware demo remains unverified.
- Atech owner confirms Big Kit 14-port board: microphone 1-2, speaker 13-14, button 3, light grid 4, detected at `/dev/cu.usbmodem1101`. SDK `atech==1.0.0a11` is installed. Physical capture/playback and firmware WSS remain the device owner's work.
- Earlier browser inspection returned "You don't have access" and inspected no project contents. The developer requested Lovable MCP; subsequent MCP reads succeeded.
- Lovable MCP was registered globally in Codex at https://mcp.lovable.dev and authenticated. Read-only MCP project, file, and database-status inspection succeeded, including directly from the PRD thread.
- Lovable project "Build for impact" is ready and unpublished at inspected commit `3c3ceacb5a0a02511eea619e6df59e38203e7246`. Its UI is a blank placeholder on TanStack Start, React 19, TypeScript, Tailwind 4, and shadcn/Radix. Database is disabled, and no voice or product backend implementation was found. [Preview](https://id-preview--1c721b93-c6e1-407b-a22d-91efc06d322b.lovable.app).
- Dedicated sandbox "Pink Hack Integration Testing" was created through MCP as project `fafa377f-6764-4ee1-850b-5870277f3ed4` in workspace `6cff6cc08b0d41c2a26b` / Klara's Lovable, matching the original test project's workspace. [Editor](https://lovable.dev/projects/fafa377f-6764-4ee1-850b-5870277f3ed4) · [Preview](https://id-preview--fafa377f-6764-4ee1-850b-5870277f3ed4.lovable.app). Worker verified revision `ce43fc813db0c83f4266f5d1d1480e039ce43fdf`, ready with no build error, unpublished, and database disabled. It contains a static testing landing page only; API/storage/voice/device remain unconfigured or unverified.
- ElevenLabs and Supabase appear enabled in the workspace connector catalog. Connected credentials and working integrations were not established by that inspection.
- Existing changes to AGENTS.md and docs/gpt_live_atech_lovable_context.md belong to prior work and were preserved.
- Corrected Azure `gpt-live-1` access probe passed from the root `.env`: real `session.started`, graceful `session.closed`, reason `close_requested`, WebSocket code 1000, final usage 0.0 seconds. The earlier Realtime rejection was the wrong protocol and is superseded as a Live blocker. Audio, tools, Atech, and full app integration remain unverified by this probe. See [API readiness](docs/api-readiness.md).

## Approved design direction

- Latest auth simplification: server constant `DEMO_USER_ID = "demo-user"` in `backend/apps/server/src/demo-owner.ts` replaces Better Auth in the required demo path. API/client account tokens and cookie credentials are removed; device transport credentials remain separately bound to this fixed owner. All visitors share demo records; this is an expedient hackathon mode. Backend tests/deployment and no-auth frontend migration are in progress. Sanity-check thread owns current product-doc auth changes; Main owns status; the earlier PRD thread is complete. Previous authenticated-build evidence is not fixed-user acceptance evidence.
- Hosting correction: use existing [Vercel project](https://vercel.com/quasr/pink-hack) for the app backend and existing Turso for storage. Azure remains the Live provider. The previously allocated Azure VM URL is superseded as the API target; its earlier smoke checks are historical evidence only. Backend owner must supply a verified Vercel runtime origin and establish WSS/audio relay support before same-service device claims.
- Storage correction: the developer supplied `DATABASE_URL` and `DATABASE_API_KEY` in root `.env` and selected Turso as the sole deployed database. Backend owner configures that existing database and verifies persistence; a new cleanup agent identifies/removes this project's obsolete non-Turso deployed database only. Application service and device relay deployment remain required. No credentials are recorded here.
- Latest direction is direct voice-agent Journal writing. Use [flexible pages and journal correction](docs/flexible-pages-journal.md): arbitrary context pages, all owned pages used by the assistant, one Journal with flexible properties and BlockNote content, and day plans inside that body. `POST /journal` and revision-checked `PATCH /journal/:id` write directly on the user's request, with no mandatory held proposal, confirmation receipt, staged check-in, or review screen. Owned voice-session identity replaces a check-in prerequisite. Legacy check-in data/routes are preserved but not required. Existing Turso remains sole deployed storage. Backend/frontend/device owners are aligning the direct-write path; earlier tests do not prove it.
- Earlier Today/Patterns/About me navigation, fixed personal/medical page types, fixed metrics, separate day-plan resources and mandatory draft confirmation are superseded. Current [PRD](PRD.md), [app contracts](docs/app-structure.md), and [implementation plan](docs/implementation-plan.md) define user-created pages plus Journal and direct writes. The prior Today design is explicitly historical.
- Canonical testing target is [Pink Hack Integration Testing](https://lovable.dev/projects/ee916e8c-7f2f-4989-9c6e-cedcff1793b5), project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5` in authorized workspace `lM5BSCDhedvBnbbUoDgS` / Jonas' Lovable. [Preview](https://id-preview--ee916e8c-7f2f-4989-9c6e-cedcff1793b5.lovable.app). Corrective remix verified through MCP at revision `369b6384898a390feaa381aca4ee246141901bb0`: ready, no runtime error, unpublished, database disabled, landing-page source identical to the initial scaffold. No separate build or workflow test was run. The Klara sandbox is retained but is not the integration target.
- App and device use the same owned context and Journal. Device firmware targets the fixed Vercel WSS contract; the SDK's USB-only defaults need adaptation. There is no planned configurable/laptop bridge in the current product path.
- Backend owner completed Vercel/Turso deployment, direct-write API, reusable browser client and same-service device relay. See [backend contract and verification](docs/backend.md). Browser WebRTC UI and physical Arduino audio remain distinct acceptance checks.

## Work outcomes

| Outcome | Owner | State | Evidence or dependency |
| --- | --- | --- | --- |
| Turso cutover and obsolete database cleanup | Backend owner + coordinator's cleanup worker | Cleanup complete; production persistence verified by backend owner | No obsolete hosted DB existed, so nothing was deleted. Vercel/Turso direct Journal POST, reload, PATCH, retry/conflict and stale-revision checks passed in backend owner's production test |
| PRD and full app structure | PRD main thread | Draft delivered; document checks passed | Routes, records, shared API, and acceptance documented; links/fences checked; architecture interaction passed at 728px and 360px |
| GPT-Live readiness | Delegated API researcher + PRD main thread | Documentation checked; Azure access passed | Real startup/close confirmed `gpt-live-1`; audio, delegated tools, and device remain pending |
| Root .env API access probe | PRD main thread | Corrected Azure Live probe passed | One Live session started/closed in 1.49s, usage 0.0s; no audio/tools/writes. Earlier Realtime failure superseded. Existing claude-impact-lab adapter paths and sanitized result sent to backend owner |
| Backend/API/storage and client | Backend owner | Previous build verified; fixed-user transition assigned | `dpl_Ak43VzrcBBiwjuD27reY4y6e4WNF` direct storage and synthetic device audio passed. Now remove Better Auth and redeploy fixed shared-user API/client under existing ownership; final no-token signatures and new-build checks pending |
| Lovable frontend implementation | Coordinator's sole Lovable frontend worker | Prior integration operation complete; fixed-user change awaits backend ready | Previous account-flow results are superseded. Next sequential mutation removes account/sign-in/token/cookie gates and autoloads pages/Journal against revised fixed-user backend/client. Direct writes/editor/retry behavior retained; no competing writer |
| Dedicated Lovable testing sandbox | Coordinator's provisioning workers | Complete; no active provisioning | Canonical project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5` in Jonas' workspace; ongoing app work belongs only to the frontend writer |
| Atech voice integration | Atech SDK thread | Local hardware PCM capture/replay verified; direct WiFi voice pending | SDK 1.0.0a11 installed; 14port mic1-2/spk13-14/button3/grid4 project built/flashed, boot check passed. Four real captures had zero clipped samples; developer confirmed replay. Volume doubled to40% and flashed. Interruption/heap stability and actual device WSS/GPT-Live remain unverified; see hardware/atech/README.md |

## Next outcomes

Frontend integration handoff is ready: backend owner verified production `https://pink-hack.vercel.app` at deployment `dpl_Ak43VzrcBBiwjuD27reY4y6e4WNF`, including Better Auth, Turso direct writes/reload and retry/revision protections. CORS/trusted auth for `http://localhost:8080` and the canonical preview passed. The sole frontend writer is connecting fixed host and frozen owned-voice-session client/callback in one sequential mutation. Backend authenticated WSS, real Azure synthetic PCM and agent-saved Journal readback passed. Browser app/WebRTC UI and physical hardware remain unverified; browser startup/close is a distinct acceptance test, not another standalone paid access probe. The synthetic device claim was released; only the hardware owner coordinates real private provisioning.

1. Use canonical sandbox `ee916e8c-7f2f-4989-9c6e-cedcff1793b5` for integration testing. Sole frontend writer owns remote mutations and real browser save/reload/recovery and WebRTC checks. Final submission destination remains the developer's choice.
2. Atech owner completes the local physical microphone/speaker test, adapts SDK firmware to the verified WSS contract, and tests real device writing/readback. No other agent owns the USB port or provisions the singleton device concurrently.
3. Backend owner builds from PRD.md and docs/app-structure.md using Better-T-Stack; Lovable frontend consumes that API. Integrate the verified root-file Azure Live settings and adapt the existing claude-impact-lab voice transport. Coordinate voice/hardware ownership and test real audio/tools/persistence through the shared API.
4. Exercise a real writing request through voice, direct Journal save, app readback and day-plan page edit. Record the passing frontend/backend/firmware revisions and environment as the demo candidate.
5. Prepare project name, team names, truthful problem/solution statements, demo link, and bonus answers for the 15:00 check-in. Submission status is unknown.
6. Verify the final demo link, rehearse a three-minute pitch, and record a fallback of the demonstrated workflow before presentation.

These are pending outcomes, not claims of completed implementation. No scope cuts or substitute mocks have been approved.

## Design-to-backend handoff

- Shared contracts use BlockNote JSON and flexible scalar/list Journal properties, direct POST/PATCH and owned voice-session identity. Fixed energy/extraction/plan acceptance are not required by the current product. Legacy rows/routes remain compatible.
- Vercel hosts the existing Hono/Node service; Turso supplies sole deployed storage, with Better Auth and backend-only credentials. Local SQLite tests are not production evidence.
- Backend source `99c316c` and verification docs `4d45f10` are the handoff. Frontend and firmware are single-writer tracks; doc owners reconcile claims without duplicating implementation or runtime probes.

## Obsolete hosted database cleanup

- Read-only cleanup inventory on 2026-10-24 found no separate non-Turso database to delete. Azure CLI `az resource list --resource-group rg-pink-hack-demo` returned exactly six resources in subscription `271af4b8-0dc1-46d0-b64b-31cc1676c3b8`: app VM `pink-hack-demo`, OS disk `pink-hack-demo_OsDisk_1_e1d60748b41c4da9904910068963a8d3`, public IP, NSG, virtual network, and NIC. No database service appeared. `az vm show` confirmed that disk is the app VM's OS disk and there are no data disks. All resources were preserved.
- Lovable MCP `get_database_status` returned `enabled: false` for the canonical project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5`, retained sandbox `fafa377f-6764-4ee1-850b-5870277f3ed4`, and original test project `1c721b93-c6e1-407b-a22d-91efc06d322b`.
- Backend owner `dac033a2-a1c4-48ee-a7cb-39cb86afe1a7` confirmed no separate hosted database was created and reported the VM's planned SQLite directory is still empty. Cleanup made no provider mutations, accessed no credentials, and deleted no data or files. Turso configuration, migrations, deployed service cutover, and remote persistence verification remain the backend owner's work; this cleanup does not establish their completion.

## Backend production integration evidence

- 2026-10-24: existing Vercel production and existing Turso are active. Additive migration preserved legacy rows and passed foreign-key checks; private pre-migration backup retained. No new database was provisioned.
- External authenticated HTTP passed Better Auth identity, localhost:8080 CORS, direct Journal create/read/PATCH, exact retries and conflicts. Native WSS rejects unauthenticated upgrades and passed a real authenticated bidirectional 16k PCM test through Azure Live and the application agent. The synthetic spoken garden request was preserved in original_text and BlockNote content; saved was emitted only after canonical entry/revision validation.
- Device test received 256000 audio bytes for 132200 input bytes, with no errors. Real Arduino capture/playback, browser voice UX and 300-second reconnect behavior are not yet demonstrated. Synthetic device claim/credential was removed so the real signed-in owner can provision privately. The superseded Azure VM was deallocated.

## Fixed-owner backend simplification

- Backend sole writer removed Better Auth runtime/workspace/dependencies/account routes/required auth env and client sessionToken plumbing. One server-owned `demo-user` resolves every app/voice/provision request; legacy users and records remain intact under original ownership. Turso seed/row-count/foreign-key checks passed with no schema change.
- Production `dpl_DPC2xZNK5MY8tVpVcWELTqs5SHKy` is READY at https://pink-hack.vercel.app. No-cookie/no-token context and Journal create/PATCH/reload/retry/stale tests passed; account routes are404 and owner spoofing is rejected. Private device-token WSS open/stop passed after no-account provisioning, zero provider calls. Exact new synthetic test records/claim removed afterward; no legacy deletions.
- 51 tests, types and build pass. Revised API factory is `createApp(db,config,providerFetch?)`; voice client has no sessionToken, uses credentials omit/Content-Type only, with unchanged owned voice session/agent DTOs. Readiness sent to main, sanity-check and frontend/device owners. Browser no-login UI and hardware tests belong to those tracks.
