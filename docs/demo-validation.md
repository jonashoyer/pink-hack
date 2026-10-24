---
provenance: "Unvetted Synthetic"
---

# Demo validation

This document checks the planned demo story against the running product before the pitch is written. It separates what was observed from what other owners have reported and what is still untested. **Status: in progress. The demo story is not validated yet.**

## Pinned revisions and environment

| Part | Revision | Source of evidence |
| --- | --- | --- |
| Backend source | `e2d33ad` (HEAD) | `git log` in this checkout |
| Backend deployment | `dpl_DPC2xZNK5MY8tVpVcWELTqs5SHKy` at https://pink-hack.vercel.app | Backend owner report in [backend.md](backend.md) |
| Lovable frontend | op6 `f648b42335d396fc58613848c26bf2531e7a63eb` (no-login); `381ae914` superseded (old auth) | Independently inspected by Main; owner's live REST checks and 93 tests accepted as reported |
| Atech firmware | SHA-256 `35834e85…1410d2a`, volume 0.4, ESP32-S3 rev 0.2. Latest: temporary PinkHack-Setup portal, one-time HTTPS provisioning, token in NVS; direct WiFi/WSS transport build pending | Hardware owner report via Main. Proven: local mic/speaker only |

## Observed by this worker

| Time (CEST) | Check | Result |
| --- | --- | --- |
| 13:55 | `GET /health` | 200 `{status:"ok"}` |
| 13:55 | `GET /api/v1/context`, no cookie or token | 200, `profile.owner_id:"demo-user"`, **0 pages** |
| 13:55 | `GET /api/v1/journal?limit=100`, no cookie or token | 200, **0 entries** |
| 13:55 | `GET /api/auth/get-session` | 404 (auth removed) |
| 13:57 | Open the preview URL in T3 browser (incognito and default profiles) | **Redirected to lovable.dev login** ("Internal Lovable project"). The app UI was not reachable. |
| 14:3x | Anonymous `curl -L` of https://pink-hack-journal.lovable.app/ and `/app` | Both 200, 0 redirects |
| 14:3x | Incognito T3 browser, landing page | Title "Pink Hack — Your day, in your words."; copy: flexible journal for life after cancer treatment, context pages, Journal, day plan; shows "App integration in progress". No voice, device, statistic or clinical claim. Screenshot timed out. |

No writes were made by this worker.

## Blocking issues

1. **Resolved for the landing page:** the public landing at https://pink-hack-journal.lovable.app/ (source `822c5410`, Lovable deployment `33b15b63`) opens anonymously. The `id-preview` URL still requires a Lovable login; `/app` on the public host is the candidate app link. Its API CORS check is with the audit owner. Earlier note: Anonymous access to the `id-preview` URL is blocked. The user has now authorized publishing a minimal public landing page through the sole Lovable writer. The published URL and anonymous access still need verification by 15:00 Europe/Copenhagen; this preview is not a verified public submission link.
2. **The shared demo space is empty.** The demo needs context pages for the assistant to use. The plan is to seed two labeled synthetic pages after op6 lands (see below).
3. **Independent UI validation is blocked for this worker.** No Lovable MCP or `localhost:8080` harness is available in this session. UI acceptance relies on the frontend writer's evidence until one of those is available.

## Story under validation

Chosen from the Notion research page "User Research, user story", Persona 1 ("The Adherence Risk"). That persona is a **composite built from published research, not a patient interview**.

- **Who:** a woman 1–3 years into aromatase-inhibitor therapy after breast cancer, living with joint stiffness and fatigue.
- **Why Persona 1:** we chose it for this demo because daily stiffness and fatigue notes and a day plan fit the current journal path most directly. Personas 2 and 3 remain valid uses of the same journal, for example lymphedema self-care or emotional journaling. They are simply not the demo story.
- **Need it serves (research-based hypothesis, not observed in patients):** the composite persona describes pain and fatigue going untracked between oncology visits, so they may come up late. A short daily log in her own words, and a plan she can manage today, fit that gap. The persona's ranked needs 1, 2 and 4 cover this.
- **Path:** her context pages ("What I want to track", "What helps me") → she speaks a morning check-in and asks for a gentle plan → the assistant saves a Journal entry with her properties and a Day plan section → she opens the entry in the app.
- **Out of scope for claims:** adherence improvement, clinical outcomes, recommending medication changes. The assistant is instructed not to diagnose or recommend treatment changes (`backend/apps/server/src/voice/prompts.ts`).

### Citation check

- Kim, Chen, Reid. *Current and future advances in practice: aromatase inhibitor-induced arthralgia.* Rheumatol Adv Pract 2024;8(2):rkae024 (PMID 38601139). The abstract, retrieved via PubMed E-utilities, reports **mean AIA incidence 39.1%** and **mean discontinuation due to AIA 9.3%**, and calls AIA "a frequent AI toxicity contributing to non-adherence and discontinuation."
- The Notion statement that "roughly 1 in 5 women quit" is **not supported** by this source and is not used in the pitch.

## Voice blockers reported by the readiness auditor

Reported by auditor thread `e8b461f1`, positions 50–53. The backend owner (`dac033a2`) owns the fixes. This worker did not reproduce them, and runs no new probe or rehearsal until they are fixed.

- **Duplicate writes on callback retry.** Two in-memory agent runs had the same delegation ID and different generated tool-call IDs. They produced two Journal entries (`sameEntry:false`, `entryCount:2`), because the mutation ID includes the provider tool-call ID (`voice/agent.ts`, `voice/tools.ts`).
- **Stop leaves the backend conversation active.** Browser `close()` sends only provider `session.close`, `POST /voice/sessions/:id/stop` returned 404, and the conversation state stayed `active`. `stopVoiceConversation` has no production caller, and device stop doesn't persist state either.
- **The audited Lovable revision `381ae914` still uses the removed session routes.** Op6 is meant to replace it.

Frontend writer update: op6 validates the no-login UI and storage, plus one browser transport start/close. After that, the writer will copy in the fixed client once the backend owner deploys the durable replay fix and `/voice/sessions/:id/stop`. Until a rehearsal on that fixed build passes, voice writing and Stop are not presented as validated. Evidence from the affected build doesn't count.

## Op6 evidence boundary

- Accepted as reported: no-login UI and REST storage at `f648b423`, 93 tests.
- **Browser voice: not proven.** The browser hit an ICE timeout before the voice-session POST, so op6 gives no voice startup proof and no voice write proof.
- Gate rule: a fallback recording counts only if it shows a real validated run. If none exists, nothing substitutes for a failed live voice write. The pitch then drops the voice-write claim rather than showing an unvalidated or mocked recording.

## Deck rules (from Main, 14:20)

- The live voice-write gate (G3) covers every statement, slide and demo action that implies voice writing, not only the line "everything was live".
- The medical small print says the assistant is "instructed not to" diagnose or advise on treatment.
- The fallback recording (G10) exists only after a validated run has been recorded.
- The landing page (15:00) and the app demo (16:30) are separate links with separate checks.
- The pilot's duration is presented as a proposal.

## Delivery decisions

- Latest user priority is a minimal public Lovable landing link first, then the main app/backend. At 14:01:47 CEST the user said one hour for the link; use the existing 15:00 Europe/Copenhagen check-in as the practical deadline. Landing publication is authorized and belongs to the sole Lovable writer, sequentially after active op6. This supersedes the earlier publishing approval gate. No form submission is authorized. A published landing is not evidence of a working voice demo.
- Persona 1 is acceptable narrative grounding. Present it as a composite, never as patient validation.
- Prefer a concise problem description to incidence statistics. Omit the unsupported "1 in 5" claim.
- Seed exactly two clearly labeled synthetic context pages after op6, with exact page IDs and operation IDs recorded. Seed no clinical data.
- Keep browser voice and physical device evidence as separate claims.

The new top-level [Opus demo/outline thread](t3-thread://v1/mcp:ce64b6d8-c0c2-4150-ba33-578611d7a04e) owns `docs/demo-deck-outline.md` and can improve the planned story and draft slide outline now. The existing Demo worker retains this validation document, the demo script, and eventual deck execution. A finished deck must match the validated candidate. The outline thread does not edit frontend/backend/firmware, run paid probes, seed records, publish, submit forms, or add a Presentation status row.

## Pending

- ~~Landing gate~~ **Passed:** public landing anonymous 200 with the expected copy, independently confirmed by Main. Visual desktop/mobile smoke is reported by the writer only (snapshots timed out here). The app link `/app` is still gated on public-origin CORS, the fixed backend deployment, the stop-aware client and one genuine voice loop.
- Corrected backend (durable replay and `/voice/sessions/:id/stop`) deployed, the fixed client in Lovable, and one post-fix voice-write E2E coordinated by review thread `c2ad9013`.
- Final hostname, then an anonymous GET/OPTIONS/CORS check by the separate audit owner.
- Corrected `demo-deck-outline.md` (team names, hook, pilot wording, fallback).
- Seeding the demo context pages, then one distinct rehearsal voice session after the frontend writer gives the go-ahead.
