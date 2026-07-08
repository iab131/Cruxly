---
name: upload-media-workflow
description: Use when working on Cruxly user uploads, S3 media handling, image proxying, public upload artifacts, and upload-related API/UI validation.
---

# upload-media-workflow

## Purpose

Guide changes to Cruxly user uploads, S3-backed media handling, image proxying, and upload-related UI/API validation.

## When To Use

- Use when editing upload API routes, S3 presigning logic, image proxy behavior, or media display components.
- Use when debugging missing, broken, or stale uploaded images.
- Use when touching `public/uploads/` or upload-related problem/comment flows.

## Safety Rules

- Inspect the repository before changing files.
- Do not install dependencies, make network calls, or delete files unless the user asks.
- Ask for approval before running risky commands.
- Do not commit local upload artifacts unless the user explicitly wants fixtures.
- Do not print credentials from local config.
- Treat upload and proxy endpoints as trust boundaries.

## Commands

```bash
npm run lint
npm run build
```

Important files and evidence:

```text
src/app/api/upload/
src/app/api/image-proxy/
public/uploads/
public/uploads/beta/
public/uploads/comments/
@aws-sdk/client-s3
@aws-sdk/s3-request-presigner
```

## Project Conventions

- Validate both API behavior and UI rendering for upload changes.
- Keep local public artifacts separate from durable app data.
- Check problem and comment flows when media behavior changes.

## Known Pitfalls

- Build can pass while media fails from missing runtime configuration.
- Local files in `public/uploads/` may not represent production storage behavior.
- Image proxy changes can affect multiple app surfaces.

## Output Expectations

- State what changed.
- State what was verified.
- List any upload, proxy, or artifact cleanup risk.
