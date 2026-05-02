# Second Brain Hub — Public Demo

**Date:** 2026-05-01
**Status:** Approved (design phase)
**Owner:** Dre

## Goal

Ship a public, sharable artifact that lets friends see — and optionally clone and run — the Second Brain Hub. Two outputs: (1) a live Vercel-deployed demo at a public URL, (2) a public GitHub repo (`second-brain-hub-demo`) they can clone.

The demo is a UI showcase. The real system at `~/second-brain-hub/` (Next.js 16 + FastAPI, Ollama + Gemini, personal vault retrieval) stays local. The demo runs frontend-only on scripted fake data so visitors never need a backend, an LLM key, or any of Dre's personal content.

## Non-goals

- No exposing the real vault (`~/second-brain/`) or any personal notes.
- No FastAPI server folder, no Ollama, no Gemini calls in the demo.
- No replicating the full feature set of every hub surface.
- No long-term sync with the private hub. UI changes get pulled forward manually when Dre wants to refresh the demo.
- No user accounts, no telemetry, no analytics.

## Audience

Friends (technical and not), and anyone Dre links to it. Repo is public on GitHub; live URL is shareable but not promoted. Should be self-explanatory in 30 seconds — landing hero, "Enter the War Room" CTA, scripted timeline that visibly evolves.

## Architecture

### High-level

```
                 ┌───────────────────────────────┐
 visitor ──────▶ │  Vercel-hosted Next.js (SSG)  │
                 │                               │
                 │  components/mission/war-room  │ ──reads──▶  in-memory store
                 │       (copied from hub)       │             │
                 │                               │             │
                 │  lib/demo-data.ts             │ ──ticks──▶  lib/demo-timeline.ts
                 │  (matches hub API surface)    │             (90s loop, mutates store)
                 └───────────────────────────────┘
```

No backend. No FastAPI. No SSE. The existing 5-second React polling in `app/mission/page.tsx` reads the in-memory store, which a separate `setInterval` mutates on a schedule.

### Repo layout

```
second-brain-hub-demo/
├── app/
│   ├── layout.tsx            # copied from hub (with demo nav)
│   ├── page.tsx              # NEW public landing
│   ├── mission/
│   │   ├── page.tsx          # copied from hub, unchanged
│   │   └── war-room.css      # copied from hub
│   ├── chat/page.tsx         # NEW skeleton + tooltip banner
│   └── supapara/page.tsx     # NEW skeleton + tooltip banner
├── components/
│   ├── mission/war-room/     # copied verbatim from hub
│   ├── nav/                  # copied; "Demo" badge added
│   ├── ui/                   # shadcn/ui copied
│   ├── theme/                # copied
│   └── landing/              # NEW: hero, feature-strip, arch-diagram, footer
├── lib/
│   ├── mission.ts            # types only — copied verbatim
│   ├── mission-derive.ts     # copied verbatim (pure logic)
│   ├── demo-data.ts          # NEW; replaces hub lib/api.ts + lib/mission.ts data fns
│   ├── demo-timeline.ts      # NEW; tick engine
│   ├── demo-fixtures.ts      # NEW; agents, task templates, tool-activity templates
│   └── use-agent-chat.ts     # SHIMMED — returns inert chat state for War Room
├── public/                   # favicon, fonts copied from hub
├── README.md                 # short: what this is, run locally, deploy own copy
├── ARCHITECTURE.md           # explains the real hub (FastAPI + Ollama + vault)
├── package.json              # frontend deps only
├── pnpm-lock.yaml
├── next.config.ts            # static export friendly
├── tsconfig.json             # copied
├── postcss.config.mjs        # copied
├── eslint.config.mjs         # copied
├── tailwind / globals.css    # copied
└── vercel.json               # deploy config
```

Notably absent: `server/`, `scripts/start.sh`, `playwright.config.ts`, `.logs/`, anything pointing at `~/aidre/` or `AIDRE_ROOT`, anything reading `secrets.env`.

## Demo data layer

### Contract

`lib/demo-data.ts` exports the same function signatures the hub UI already calls:

- `getDashboard(): Promise<Dashboard>`
- `getTasks(status: TaskStatus): Promise<{ tasks: MissionTask[] }>`
- `getToolActivity(opts: { limit: number }): Promise<{ tools: ToolActivity[] }>`
- `pauseAutonomy()`, `resumeAutonomy()`, `clearAutonomyRateLimit()` — no-ops returning resolved promises
- `openClaudeSession(...)` — no-op returning a fake session id

Types come from `lib/mission.ts` (copied verbatim from the hub) so the War Room components compile unchanged.

### In-memory store

A module-level singleton object holding current `Dashboard`, `MissionTask[]` (active + done), `ToolActivity[]`, `HiveNote[]`, and `AutonomyStatus`. Mutated only by `demo-timeline.ts`. Read by `demo-data.ts`. Both modules import the same store instance.

### Timeline engine

`demo-timeline.ts` exports `startTimeline()` and `stopTimeline()`. Started once on the client when `/mission` mounts; cleaned up on unmount. Drives a 90-second loop using a single `setInterval` at 1Hz:

| Phase | Time | What happens |
|-------|------|--------------|
| Boot | 0–5s | Agents idle, 2 queued tasks visible |
| Run-up | 5–15s | 2 tasks flip to `live`, agents go `thinking` → `tool`, first tool activities stream in |
| Delegation | 15–30s | Architect agent delegates to scout (delegation badge animates), 1 task completes |
| Deep work | 30–60s | New task spawns `queued` → `live`; tool activity continues; hive notes append (summary, decision) |
| Wrap | 60–80s | Tasks complete, hive notes append (next_step, log), agents `thinking` → `idle` |
| Lull | 80–90s | Agents idle, then store resets to boot state |

Phase transitions are time-keyed, not random, so the visual rhythm is predictable and demo-able.

Tool-activity entries push onto a capped ring buffer (max 50). Hive notes append (max 30 retained). Tasks move between `active_tasks` and a separate `done` array, mirroring how the real backend exposes them.

### Fixtures

`demo-fixtures.ts` holds:

- **4 agents:** Architect (`gemini`/`reason`), Scout (`ollama`/`fast`), Scribe (`ollama`/`general`), Runner (`claude_code`/`code`). Generic personas, no resemblance to private aidre agents.
- **~12 task templates:** generic knowledge-work tasks ("Summarize quarterly meeting notes", "Draft outline for blog post", "Index new vault entries", etc.). No personal/Navy/teaching/family content.
- **~30 tool-activity templates:** plausible tool calls (`vault.search`, `vault.read`, `web.fetch`, `notes.write`, `summarize`, etc.) with short fake arguments and outputs.
- **~10 hive-note templates** across the four `HiveKind` values (`summary`, `decision`, `next_step`, `log`).

Templates are parameterized by phase so the timeline can pick contextually-appropriate ones at each tick.

### Chat shim

The War Room imports `use-agent-chat`. In demo mode this hook returns: `streaming: false`, an empty message list, and no-op `send`/`stop`. The chat input renders disabled with placeholder text "Chat is live in the private build."

## Public landing page (`/`)

NEW page; the hub's existing `/` is Dre's private home brief and is replaced for the demo.

Sections, top to bottom:

1. **Hero** — Headline "My Second Brain — Mission Control." Sub "An AI command center for personal knowledge, tasks, and agents." Primary CTA "Enter the War Room" → `/mission`. Secondary CTA "View on GitHub" → repo URL.
2. **Feature strip** (3-up cards) — War Room (mission control for AI agents) · Vault Retrieval (semantic search over personal notes) · Ambient Brain (context-aware suggestions). Each card has a one-line description and an icon.
3. **Architecture diagram** — visual showing Next.js frontend ↔ FastAPI backend ↔ {Ollama (local), Gemini (deep mode), Vault (Obsidian)}. Static SVG or Mermaid rendered to image.
4. **How it really works** — short prose paragraph (~80 words) describing the two-process app, the polling/SSE model, why local-first, and a link to `ARCHITECTURE.md`.
5. **Footer** — "Built by Dre · Bremerton, WA" + GitHub link + small "Demo mode" pill.

Visual treatment matches War Room aesthetic (dark, red accent — same `rgba(232,69,69,…)` glow per stored feedback).

## Light-tour pages

`/chat` and `/supapara` each render the standard hub shell (nav + sidebar, same as production) and a single centered card:

> **Demo mode — structure only**
> *(one-line description of what this surface does in the real system)*
> Live in the private build; not exposed in this demo.

Per-page descriptions:

- `/chat` — "Chat surface. Local Ollama for fast turns; Gemini Deep Mode for long reasoning runs."
- `/supapara` — "SupaPara HQ. Embedded view of the SupaPara para-tool vault."

The hub's home surface (Brain Brief, suggestion rail, ambient context strip) is represented in the landing page's feature strip rather than as a separate `/home` route. No `/settings` route in the demo.

## Branding + nav

- Repo: `second-brain-hub-demo` (public GitHub).
- Page title: "Second Brain Hub — Demo."
- Nav adds a small "DEMO" pill next to the logo (red, matches War Room accent), always visible.
- No login UI, no user avatar.

## Deploy

- Vercel project linked to the GitHub repo. Auto-deploy on push to `main`.
- `vercel.json` minimal — Next.js framework preset.
- Domain TBD by Dre at deploy time. Defaults: `second-brain-hub-demo.vercel.app`. Custom domain optional (`secondbrain.dre.dev` or similar).
- No environment variables required to run. Demo mode is the only mode.

## Documentation

### `README.md`

Short. Sections:

1. What this is (one paragraph: "Public UI demo of my personal second brain. The real system runs locally on my machine — this is the frontend on scripted fake data so you can see how it feels.")
2. Run locally: `pnpm install && pnpm dev`.
3. Deploy your own copy: one-click Vercel deploy button.
4. "How the real system works" → link to `ARCHITECTURE.md`.
5. License (MIT).

### `ARCHITECTURE.md`

The piece that actually shows friends "how it's set up." Sections:

1. **Two-process app** — Next.js frontend (`:3000`) + FastAPI backend (`:8000`), launched via a single `start.sh`.
2. **Backend layer** — FastAPI imports the `aidre/lib/` package directly (no duplication). Endpoints expose dashboard, tasks, tool activity, search, run streaming via SSE.
3. **LLM routing** — Ollama for fast/general/code tiers (local, no API cost), Gemini for the `reason` tier in Deep Mode (set `GEMINI_API_KEY`).
4. **Vault retrieval** — Obsidian vault at `~/second-brain/`, indexed and searchable.
5. **Mission / War Room** — agent model: 4-tier runtime (gemini, ollama, claude_code), task lifecycle (queued → live → done|failed), hive-notes for inter-agent communication, tool-activity stream for visibility.
6. **Why local-first** — privacy, cost, latency, ownership.

Diagram embedded as SVG or Mermaid. ~600–900 words target.

## Testing

- `pnpm build` succeeds with strict TS.
- `pnpm lint` clean.
- Manual QA before announcing: visit each route in the deployed Vercel preview URL on desktop and mobile width; confirm War Room timeline visibly progresses through all phases over 90s.
- One Playwright smoke test (optional, low priority): navigate to `/mission`, wait 10s, assert at least one tool-activity row rendered. Skip if it adds friction; manual QA is acceptable.

## Risks + mitigations

- **Personal data leak via copied files.** Mitigation: explicit copy list in implementation plan; never `cp -r` whole folders. Diff every file. No `.env*`, no `server/`, no `aidre/` paths.
- **Demo timeline feels canned.** Mitigation: 90s loop with phase transitions, varied fixture pool, randomized fixture selection within each phase so two visits aren't identical.
- **War Room components break when shimmed chat is inert.** Mitigation: read the hook's interface exactly; return shape that satisfies all consumers. Verify by running locally before push.
- **Hub UI evolves; demo drifts.** Accepted. Sync is manual and infrequent.

## Open items

- Domain choice — Dre picks at deploy time.
- GitHub handle on footer — Dre fills before publish.
- Architecture diagram source — Mermaid in markdown vs hand-built SVG. Plan phase decides.

## Out of scope (explicit)

- Settings page.
- Real LLM integration of any kind.
- Persisting visitor state across reloads.
- A11y audit beyond what the hub already has.
- Internationalization.
- Mobile-optimized War Room layout (the real one isn't mobile-optimized either; demo matches).
