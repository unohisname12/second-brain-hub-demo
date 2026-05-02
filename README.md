# Second Brain Hub — Public Demo

Public UI demo of my personal Second Brain Hub. The real system runs locally on
my workstation — this is the frontend running on a 90-second scripted timeline
so you can see what the War Room feels like without any backend, LLM keys, or
real personal data.

**Live demo:** *(URL will be set after first Vercel deploy)*

**Want to know how the real system actually works?** See [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## What's in here

- `/` — public landing
- `/mission` — War Room headliner running on scripted demo data (90s loop)
- `/chat`, `/supapara` — structure-only skeletons; the real surfaces are private

The War Room components (`components/mission/war-room/*`) are copied verbatim
from the private hub. The data layer is replaced with `lib/demo-*` modules so
nothing real is exposed.

## Run locally

Requires Node 20+ and `pnpm`.

```bash
pnpm install
pnpm dev
```

Then visit `http://localhost:3000`.

## Deploy your own copy

This repo is set up for one-click Vercel deploy. Fork it, link the fork to a
Vercel project, and push to `main`. No environment variables required.

## Tests

```bash
pnpm test
```

Covers the demo data layer (store, timeline phase logic, API contract). The
React components are inherited from the production hub and aren't re-tested
here.

## License

MIT.
