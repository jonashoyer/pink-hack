---
provenance: Unvetted Synthetic
---

# Kindalong

Project for The Pink Hack, Build for Impact. Started from the [hckthn template](https://github.com/jonashoyer/hckthn).

**Approved interface:** [Kindalong design](design/README.md) selects the previous pink/rose theme and retains desktop/phone Home / Journal / Symptom navigation and daily ratings. Its four earlier screenshots and logo sheet are layout/geometry references with superseded branding. [Frontend handoff](design/lovable-handoff.md) explains how to apply it to the existing Lovable project. Superseded designs are recoverable from Git checkpoint `5f9ba1c`.

The existing [landing](https://pink-hack-journal.lovable.app/) and [app](https://pink-hack-journal.lovable.app/app) are routes in the separate Lovable frontend. This repository does not contain that frontend's components. The sole Lovable writer published Kindalong with the previous pink/rose theme at source `a3fc982cbf666e963c5eeef7eb10428dc984940b`, deployment `bc2ab442-b0d5-4acc-a4c9-1cc6ad8b3b62`. Publication and focused checks are writer-reported; real local screenshots are available in the presentation assets. This branding publication does not establish spoken voice or device integration. Repository/package and deployment identifiers remain `pink-hack`.

- [Hackathon skill](.agents/skills/hackathon/SKILL.md): coordinate main and worker threads, with guides for the [app scaffold and Vercel deploy](.agents/skills/hackathon/references/scaffold.md), [branding](.agents/skills/hackathon/references/branding.md), and a reusable HTML presentation.
- [Hackathon playbook](docs/hackathon_playbook.md): a flexible thought scaffold for setup, ideas, planning, building, and the demo.
- [AGENTS.md](AGENTS.md): coding guidelines; adapt to the project as needed.
- [PRD](PRD.md): product requirements, approved interface direction, voice journaling, and acceptance criteria.
- [App structure](docs/app-structure.md): data model, shared API contracts, voice boundary, and Atech bridge ownership.
- [API readiness](docs/api-readiness.md): documented GPT-Live contracts and current test blockers.
- [Backend setup and API](docs/backend.md): Hono/Node server, fixed-user Journal storage, and Lovable/Atech handoff.
- [Status](status.md): evidence, deadlines, and integration blockers.

## Get started

The backend is in `backend/`; Lovable is the separate frontend. The demo uses the server-owned `demo-user` for every visitor and Atech, without Better Auth, accounts, sign-in, or user-session tokens. The fixed-user API is deployed at `https://pink-hack.vercel.app`; the sole Lovable writer is applying the no-login UI revision. Revision checks, retry protection, and backend-only provider/database credentials remain.

To start the local API:

```sh
pnpm -C backend install
pnpm -C backend setup:local
pnpm -C backend/packages/db db:migrate
pnpm -C backend dev:server
```

Health: `http://localhost:3000/health`. Run `pnpm -C backend test`, `pnpm -C backend check-types`, and `pnpm -C backend build` for backend verification. See the [backend notes](docs/backend.md) for environment settings and implemented endpoints.

Use `$hackathon` (Codex) or `/hackathon` (Claude Code) in the main thread. Include the skill in worker briefs so both roles share the same workflow. Tools that do not discover repository skills can read `.agents/skills/hackathon/SKILL.md` directly.

Capture the hackathon context, sketch out `PRD.md`, and scaffold the app with the [scaffold guide](.agents/skills/hackathon/references/scaffold.md). Use an existing status document or create `status.md` when parallel work needs a shared record. Any agent can update it; the main thread reconciles requirements, changes, and evidence as work arrives.
