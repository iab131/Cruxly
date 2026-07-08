---
name: prisma-database-workflow
description: Use when changing Cruxly Prisma schema, migrations, seed data, database-backed API routes, or data access logic.
---

# prisma-database-workflow

## Purpose

Guide safe changes to Cruxly Prisma schema, migrations, seed data, and database-backed API behavior.

## When To Use

- Use when editing `prisma/schema.prisma`, `prisma/migrations/`, or `prisma/seed.ts`.
- Use when changing API routes that read or write Cruxly data.
- Use before changing models that support problems, comments, feed, search, user pages, or solve flows.

## Safety Rules

- Inspect the repository before changing files.
- Do not install dependencies, make network calls, or delete files unless the user asks.
- Ask for approval before running risky commands.
- Do not rewrite existing migrations unless explicitly asked.
- Preserve existing data shape unless the requested change requires migration.
- Treat database changes as medium risk until build and affected flows are checked.

## Commands

```bash
npm run lint
npm run build
```

Important files:

```text
prisma/schema.prisma
prisma/migrations/
prisma/seed.ts
src/app/api/problems/
src/app/api/comments/
src/app/api/feed/
src/app/api/search/
src/app/api/me/
```

## Project Conventions

- Check Prisma schema before changing database-backed routes.
- Keep migration intent clear and scoped.
- Validate API callers after schema changes.
- Look for user-specific behavior in `src/app/api/me/`, `src/app/u/`, and auth-related code.

## Known Pitfalls

- A UI-only change may still break if it assumes a field not present in Prisma.
- Migration files are history; editing them casually can make local and deployed databases diverge.
- Seed data can hide missing required fields during development.

## Output Expectations

- State what changed.
- State what was verified.
- List any migration or data compatibility risk.
