---
provenance: "Unvetted Synthetic"
---

# Earlier Today-first design, superseded

The current [PRD](../../../PRD.md), [direct API contracts](../../app-structure.md), [coordinator brief](../../flexible-pages-journal.md), and [implementation plan](../../implementation-plan.md) supersede this earlier design.

The app now has user-created BlockNote context pages and one Journal with flexible properties and page content. Day plans are ordinary entry blocks. The voice agent creates and updates Journal entries directly through POST/PATCH. There is no stored proposal or required check-in/draft/confirm/commit workflow.

The developer has also removed Better Auth in favor of one fixed shared user ID. Source confirms exported `DEMO_USER_ID = "demo-user"` in [demo-owner.ts](../../../backend/apps/server/src/demo-owner.ts), used by app requests and device admission. Fixed-user tests and deployment verification remain pending. All visitors share the same records without login. This is an expedient demo architecture. The auth reconciliation owner controls the current PRD/contracts; this historical design does not prescribe login or per-visitor isolation.

Keep comfortable writing, accessible controls, truthful save/error feedback, backend scoping to the fixed identity, revision protection, and retry-safe writes. Normal unsaved editor text can remain locally. Preserve legacy records for compatibility rather than deleting data. Provider and storage keys remain on the backend.

Hosting is the existing Vercel project and existing Turso database. Azure GPT-Live remains the voice provider. The backend owner verified authenticated WSS, synthetic PCM, direct agent saving, and owned Turso reread on the previous Better Auth build. These results do not verify fixed-user behavior. Revised shared-user deployment, actual Big Kit capture/playback, Lovable browser voice, and 300-second runtime reconnect remain checks for their owners.

[The earlier mockup](2026-10-24-today-first-companion-preview.html) is historical illustration only. Its fixed screens, metric scales, separate plans, and staged workflow are not implementation requirements or a demo candidate.
