---
name: auth-and-user-flow
description: Use when changing Cruxly authentication, user profile flows, Clerk integration, protected routes, or user-specific API behavior.
---

# auth-and-user-flow

## Purpose

Guide changes to Cruxly authentication, user profile flows, protected routes, and user-specific API behavior.

## When To Use

- Use when editing Clerk integration, auth routes, middleware/proxy behavior, profile pages, or current-user APIs.
- Use when changing `src/app/me/`, `src/app/u/`, or user-specific problem/comment behavior.
- Use when debugging sign-in, sign-up, profile, or protected-route issues.

## Safety Rules

- Inspect the repository before changing files.
- Do not install dependencies, make network calls, or delete files unless the user asks.
- Ask for approval before running risky commands.
- Do not log credentials or private user data.
- Treat auth and current-user APIs as trust boundaries.
- Validate unauthenticated and authenticated states when behavior changes.

## Commands

```bash
npm run lint
npm run build
```

Important files and evidence:

```text
@clerk/nextjs
src/app/auth/
src/proxy.ts
CLERK_APPLE_SETUP.md
src/app/api/me/
src/app/me/
src/app/u/
```

## Project Conventions

- Check route protection before changing user-visible pages.
- Check API callers when changing current-user behavior.
- Keep auth setup docs aligned with implementation changes.

## Known Pitfalls

- Auth bugs often appear as redirects, missing user state, or API authorization failures.
- Build can catch server/client boundary mistakes in auth-aware components.
- Local auth configuration may differ from deployed behavior.

## Output Expectations

- State what changed.
- State what was verified.
- List remaining auth, privacy, or protected-route risk.
