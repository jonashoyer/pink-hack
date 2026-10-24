---
provenance: Unvetted Synthetic
---

# Pink Hack

Project for The Pink Hack, Build for Impact. Started from the [hckthn template](https://github.com/jonashoyer/hckthn).

- [Hackathon skill](.agents/skills/hackathon/SKILL.md): coordinate main and worker threads, with guides for the [app scaffold and Vercel deploy](.agents/skills/hackathon/references/scaffold.md), [branding](.agents/skills/hackathon/references/branding.md), and a reusable HTML presentation.
- [Hackathon playbook](docs/hackathon_playbook.md): a flexible thought scaffold for setup, ideas, planning, building, and the demo.
- [AGENTS.md](AGENTS.md): coding guidelines; adapt to the project as needed.
- [PRD](PRD.md): product requirements, app pages, guided check-in, and acceptance criteria.
- [App structure](docs/app-structure.md): data model, shared API contracts, voice boundary, and Atech bridge ownership.
- [API readiness](docs/api-readiness.md): documented GPT-Live contracts and current test blockers.
- [Backend setup and API](docs/backend.md): Better-T-Stack server, authentication, journal storage, and Lovable/Atech handoff.
- [Status](status.md): evidence, deadlines, and integration blockers.

## Get started

The backend is in `backend/`; Lovable is the separate frontend. To start the local API:

```sh
pnpm -C backend install
pnpm -C backend setup:local
pnpm -C backend/packages/db db:migrate
pnpm -C backend dev:server
```

Health: `http://localhost:3000/health`. Run `pnpm -C backend test`, `pnpm -C backend check-types`, and `pnpm -C backend build` for backend verification. See the [backend notes](docs/backend.md) for environment settings and implemented endpoints.

Use `$hackathon` (Codex) or `/hackathon` (Claude Code) in the main thread. Include the skill in worker briefs so both roles share the same workflow. Tools that do not discover repository skills can read `.agents/skills/hackathon/SKILL.md` directly.

Capture the hackathon context, sketch out `PRD.md`, and scaffold the app with the [scaffold guide](.agents/skills/hackathon/references/scaffold.md). Use an existing status document or create `status.md` when parallel work needs a shared record. Any agent can update it; the main thread reconciles requirements, changes, and evidence as work arrives.
