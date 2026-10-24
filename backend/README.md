---
provenance: Unvetted Synthetic
---

# Pink Hack backend

Created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack). Hono/Node exposes the authenticated context and journal API for the separate Lovable frontend. Better Auth and Drizzle SQLite/libSQL own user accounts and storage. See [setup, exact endpoints and current gaps](../docs/backend.md).

## Features

- **TypeScript** - For type safety and improved developer experience
- **Hono** - Lightweight, performant server framework
- **Node.js** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **SQLite/Turso** - Database engine
- **Authentication** - Better-Auth
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
pnpm install
pnpm setup:local
```

## Database Setup

This project uses SQLite with Drizzle ORM.

1. SQLite stores data in a local file, so no database server is needed. Applying the schema creates the file `DATABASE_URL` points to.

2. Update your `.env` file in the `apps/server` directory with the appropriate connection details if needed.

3. Apply the schema to your database:

```bash
pnpm -C packages/db db:migrate
```

Then, run the development server:

```bash
pnpm run dev:server
```

The API is running at [http://localhost:3000](http://localhost:3000).

`pnpm dev:server` and `pnpm start` load private provider settings from the repository root `.env`, with nonempty `apps/server/.env` provider settings taking precedence. Azure uses the Live endpoint and `api-key` authentication. A direct OpenAI key is optional. Run `pnpm build` before `pnpm start`.

## Environment Configuration

Each app owns its environment schema in `.env.schema`. Varlock generates `src/env.ts` during installation; run `pnpm run env:generate` after changing a schema. Commit schemas, and keep secrets in ignored env files or your deployment platform.

Import the generated `ENV` accessor in application code. Shared database and auth packages receive configuration or initialized clients from the application. See [Varlock's monorepo guide](https://varlock.dev/guides/monorepos/).

Bun's automatic env loading is disabled in `bunfig.toml`; the framework integration or server bootstrap loads Varlock. Node deployments must include Varlock and its dependencies alongside the app schema.

Run standalone Node/Bun tools that use Varlock from the owning app directory so they load that app's schema and env files. `env:generate` only generates TypeScript files; it does not initialize environment values in a subsequent command.

## Project Structure

```
backend/
├── apps/
│   └── server/      # Backend API (Hono)
├── packages/
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications
- `pnpm run dev:server`: Start only the server
- `pnpm run check-types`: Check TypeScript types across all apps
- `pnpm test`: Run synthetic-data backend and client-protocol tests
- `pnpm run db:push`: Push schema changes to database
- `pnpm run db:generate`: Generate SQL migrations from the Drizzle schema
- `pnpm run db:migrate`: Run database migrations
- `pnpm run db:studio`: Open database studio UI

## Better Auth Schema Generation

After changing auth plugins or schema options, run `pnpm run auth:generate` from the project root. The script runs the Better Auth CLI through `varlock run` from the owning app directory, loading the auth instance from `src/services.ts`. Review the schema changes, then use your ORM's migration workflow to apply them.
