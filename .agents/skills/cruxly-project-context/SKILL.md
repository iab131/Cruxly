---
name: cruxly-project-context
description: Use when understanding Cruxly's rock climbing web app structure, domain concepts, Next.js routes, Prisma models, auth, uploads, and local conventions.
---

# cruxly-project-context

## Purpose

Orient agents to Cruxly as a rock climbing Next.js web app before changing routes, API handlers, data models, auth, uploads, or UI flows.

## When To Use

- Use before broad changes in `src/app`, `src/components`, `src/lib`, or `prisma`.
- Use when the user asks where a feature lives or how Cruxly is structured.
- Use before creating narrower Cruxly skills or project docs.

## Safety Rules

- Inspect the repository before changing files.
- Do not install dependencies, make network calls, or delete files unless the user asks.
- Ask for approval before running risky commands.
- Treat auth, uploads, and database changes as higher-risk areas.
- Do not expose credentials from local config files or upload paths.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Project Conventions

Scanner evidence:

- Project type: Next.js / React.
- Scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`.
- Database: `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`.
- Auth: `@clerk/nextjs`, `src/app/auth/`, `src/proxy.ts`, `CLERK_APPLE_SETUP.md`.
- Uploads/media: AWS S3 SDK packages, presigner package, `src/app/api/upload/`, `public/uploads/`.
- App/API surfaces: `src/app/api/problems`, `comments`, `feed`, `search`, `me`, `solve`, `new`, `p`, `u`.

## Known Pitfalls

- The README may still contain stock Next.js text; verify domain behavior from app routes and Prisma schema.
- `public/uploads/` may contain local artifacts. Avoid committing generated media accidentally.
- Auth and upload paths can fail from missing local configuration even when code is correct.

## Output Expectations

- Summarize the relevant route/API/database area.
- Name which validation command was run.
- Call out auth, upload, or database risk when touched.
