---
name: run-cruxly-web
description: Use when running, linting, building, debugging, or validating the Cruxly Next.js web app.
---

# run-cruxly-web

## Purpose

Run, lint, build, and debug the Cruxly Next.js web app with the repo's existing npm scripts.

## Important Distinction

`run-cruxly-web` is the skill name, not a terminal command. Do not search PATH for `run-cruxly-web`. Do not claim that a `run-cruxly-web` executable should exist unless this repository explicitly defines one.

## When To Use

- Use before and after changes to pages, API routes, components, Prisma-backed flows, auth, or uploads.
- Use when validating whether a Cruxly change is ready to hand back.
- Prefer these repo commands over adding new tooling.
- Use browser tooling only if the user explicitly asks for UI smoke testing or if build/dev succeeds and browser validation is needed.

## Safety Rules

- Inspect the repository before changing files.
- Do not install dependencies, make network calls, or delete files unless the user asks.
- Ask for approval before running risky commands.
- Do not alter package manager files unless the user asked for dependency work.
- Avoid touching generated build/cache files.
- Do not use Codebase Memory MCP, graph tools, rtk, or browser automation unless clearly necessary for the user's request.
- Prefer simple shell validation before browser/MCP tooling.

## Commands

First inspect `package.json`. Validate with the scripts it actually defines.

Expected scripts:

```bash
npm run lint
npm run build
npm run dev
npm run start
```

Recommended validation flow:

```bash
npm run lint
npm run build
npm run dev
```

For `npm run dev`, do not block forever. Start it only if needed, or tell the user the command to run. If testing locally, use a bounded process/log approach. Before starting `npm run dev`, check whether a Next dev server for this app is already running. Reuse or report that server if available instead of starting duplicate servers on multiple ports. If port 3000 is already in use, check whether it is this app before starting another server.

If a change touches Prisma-backed routes, inspect:

```text
package.json
prisma/schema.prisma
prisma/migrations/
src/app/api/
```

## Project Conventions

- App Router code lives under `src/app/`.
- API handlers live under `src/app/api/`.
- Shared app code appears under `src/components/`, `src/config/`, and `src/lib/`.
- Public and local upload artifacts appear under `public/uploads/`.

## Known Pitfalls

- `npm run build` can reveal route, type, and server/client boundary issues missed during editing.
- Upload and auth flows may need local configuration to run fully.
- The project has Prisma files; app changes may depend on schema shape.

## Response Format

1. Detected scripts
2. Commands run
3. Results
4. Failures and exact files/rules
5. Next commands for the user
