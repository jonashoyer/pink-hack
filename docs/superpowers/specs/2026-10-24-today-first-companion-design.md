---
provenance: "Unvetted Synthetic"
---

# Earlier Today-first design, superseded

The developer's later 2026-10-24 flexible-pages instruction supersedes this design's fixed navigation, page kinds, metrics, and separate plan/observation model. Implement [the flexible-pages correction](../../flexible-pages-journal.md), [PRD](../../../PRD.md), [current contracts](../../app-structure.md), and [replacement implementation plan](../../implementation-plan.md).

The earlier Today-first direction had been reviewed and accepted before this correction. That historical approval does not override the later instruction. This document now records which ideas survive and which no longer constrain the build.

## Current experience

The app has a sidebar of user-created pages and one fixed Journal database. A person can add arbitrary pages for their needs. Journal entries have flexible properties and a BlockNote page body. A day plan is ordinary content within that body. The voice assistant uses owned custom pages and handles most journal creation/updates after explicit confirmation through the authenticated backend.

There are no compulsory Today, Patterns, About me, personal-needs, or medical-needs destinations. A user's pages determine appropriate questions and properties. The old energy scale is not a mandatory schema; it can be used only when appropriate to a user-chosen property.

## Retained design principles

Keep a comfortable writing column, clear typography, visible focus, labeled controls, keyboard access, accessible contrast, and touch targets. The earlier warm palette is an optional visual reference, not a required brand identity.

Retain original selected user text and context provenance where useful. Do not invent missing observations, clinical facts, or causal claims. Plans remain editable suggestions within the page content. Rest and incomplete journal days are ordinary, not failures.

Show unsaved/saving/saved/error states accurately. Preserve local drafts on failure, enforce authenticated owner/revision checks, and never announce a save before backend confirmation. Typed editing remains available, while the requested voice and Atech outcomes remain part of acceptance.

## Replaced architecture decisions

Use generic pages with native BlockNote JSON instead of fixed personal/medical text/checklist sections. Use one Journal with generic properties and page content instead of compulsory observation and separate day-plan records. Preserve legacy storage for explicit migration/audit; new writes follow the generic contract.

The existing Hono/Node, Better Auth, Drizzle/libSQL backend remains the shared storage/API owner. Deployed records use the existing Turso database supplied through root `.env`; no database service/container is provisioned. Lovable is the external frontend. Follow current contracts and backend evidence for application reasoning and device integration status.

## Historical mockup

[The prior Today-first mockup](2026-10-24-today-first-companion-preview.html) contains illustrative data and local interactions for the superseded screen proposal. It is not an implementation specification, working app, real persistence, or a substitute demo candidate.

## Current acceptance reference

Verify custom page creation and block reload, unfamiliar Journal properties, page-informed voice capture, explicit confirmed save/update, a Day plan edit that preserves unrelated content, retries, conflicts, cancellation, and cross-user isolation. Actual Atech audio is a separate required test. Use the current PRD and contracts for the detailed checks.

Testing project `ee916e8c-7f2f-4989-9c6e-cedcff1793b5` in Jonas' workspace is canonical. The assigned Lovable worker is the sole remote writer. The coordinator owns the new correction brief; the backend owner retains source/migration work. This reconciliation changed documentation only.
