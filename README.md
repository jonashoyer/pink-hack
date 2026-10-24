---
provenance: Unvetted Synthetic
---

# Here With You

Project for The Pink Hack, Build for Impact. Started from the [hckthn template](https://github.com/jonashoyer/hckthn).

**Approved interface:** [Here With You design](design/README.md) is the single source for branding, desktop/phone layouts, Home / Journal / Symptom navigation, and daily ratings. It includes exactly four screen references and one selected logo. [Frontend handoff](design/lovable-handoff.md) explains how to apply it to the existing Lovable project. Superseded designs are recoverable from Git checkpoint `5f9ba1c`.

The existing [landing](https://pink-hack-journal.lovable.app/) and [app](https://pink-hack-journal.lovable.app/app) are routes in the separate Lovable frontend. This repository does not contain that frontend's components. Pushing the design files here does not automatically restyle or publish those pages; the public browser audit still found Pink Hack branding. The repository/package and deployment identifiers may remain `pink-hack` while the product name is Here With You.

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
