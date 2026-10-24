---
provenance: "Unvetted Synthetic"
---

# Earlier Today-first design, superseded

The current [PRD](../../../PRD.md), [direct API contracts](../../app-structure.md), [coordinator brief](../../flexible-pages-journal.md), and [implementation plan](../../implementation-plan.md) supersede this earlier design.

The app now has user-created BlockNote context pages and one Journal with flexible properties and page content. Day plans are ordinary entry blocks. The voice agent creates and updates Journal entries directly through authenticated POST/PATCH. There is no stored proposal or required check-in/draft/confirm/commit workflow.

Keep comfortable writing, accessible controls, truthful save/error feedback, ownership checks, revision protection, and retry-safe writes. Normal unsaved editor text can remain locally. Preserve legacy records for compatibility rather than deleting data.

Hosting is the existing Vercel project and existing Turso database. Azure GPT-Live remains the voice provider. Current device WSS capability and the direct voice integration require actual evidence.

[The earlier mockup](2026-10-24-today-first-companion-preview.html) is historical illustration only. Its fixed screens, metric scales, separate plans, and staged workflow are not implementation requirements or a demo candidate.
