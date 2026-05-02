# Architecture — Second Brain Hub (the real one)

This document describes the actual system that runs on my workstation. The repo
you're looking at is a UI-only demo of it. The real one is private, but the
shape is exactly this.

## Two-process app

The hub runs as two processes, started by a single `scripts/start.sh`:

- **Frontend** — Next.js 16 (App Router) + Tailwind v4 on `:3000`
- **Backend** — FastAPI + uvicorn + SSE on `:8000`

The frontend polls the backend every 5 seconds for dashboard, tasks, and tool
activity. Long-running operations (chat, agent runs) stream over Server-Sent
Events instead of polling.

## Backend imports `aidre/lib/`

The FastAPI backend imports the `aidre/lib/` package directly. No duplication,
no copying of agent logic. `aidre` is a separate repo that holds the LLM
plumbing — clients, tools, agent definitions. The hub backend is essentially a
thin HTTP layer over those primitives.

## LLM routing

Three tiers, three runtimes:

| Tier      | Runtime       | Use                                   |
|-----------|---------------|---------------------------------------|
| `fast`    | Ollama        | Quick queries, short summaries        |
| `general` | Ollama        | Note writing, hive entries            |
| `code`    | Claude Code   | Repo edits, shell, multi-step coding  |
| `reason`  | Gemini Deep   | Long reasoning runs, decision drafts  |

`fast` and `general` stay on Ollama for cost and privacy. `reason` only
activates if `GEMINI_API_KEY` is set; otherwise the system gracefully falls back
to Ollama. `code` invokes Claude Code as a subprocess; the agent gets a
sandboxed worktree to operate in.

## Vault retrieval

The vault is an Obsidian-flavored markdown tree at `~/second-brain/vault/`,
maintained by hand and via a staging-then-apply pipeline (`/staging` →
review → `/vault`). It's indexed for both BM25 and embedding search; the
backend exposes a `/mission/search` endpoint that blends both.

## Mission / War Room

The Mission domain has four primary objects:

- **Agent** — persona + role + runtime + tier + tool allowlist
- **Task** — `queued → live → done|failed`, optionally assigned to an agent
- **Hive note** — inter-agent communication: `summary`, `decision`, `next_step`, `log`
- **Tool activity** — `kind: "call" | "result"` with a one-line summary

The War Room UI shows agents in a top bar (status derived from their current
task), the active/queued task list, the recent hive (decisions and logs), and a
streaming tool-activity feed. Autonomy controls (pause/resume, rate-limit
clear, "open in Claude Code") sit at the top.

In production the War Room polls every 5 seconds and streams long-running
agent invocations over SSE. In this demo, polling reads a singleton in-memory
store mutated by a 1Hz scripted timeline (`lib/demo-timeline.ts`) — same
component code, different data source.

## Why local-first

- **Privacy** — vault never leaves my machine.
- **Cost** — Ollama is free; Gemini only fires when explicitly requested.
- **Latency** — sub-second turns for the fast tier.
- **Ownership** — when this AI cycle ends, my notes are still mine.

## Demo vs real

| Concern              | Real hub                                 | This demo                          |
|----------------------|------------------------------------------|------------------------------------|
| Backend              | FastAPI + uvicorn (`:8000`)              | None                               |
| LLMs                 | Ollama + Gemini + Claude Code            | None                               |
| Vault                | `~/second-brain/vault/` (private)        | None                               |
| Data source          | SQLite + embedded vector index           | In-memory scripted timeline (90s)  |
| Polling cadence      | 5s                                       | 5s (unchanged)                     |
| Agent runs           | Real LLM calls over SSE                  | Inert chat shim                    |
| Autonomy controls    | Wire-level pause/resume                  | Cosmetic (toggles store state)     |
| Routes               | `/`, `/chat`, `/mission`, `/supapara`, `/settings` | `/`, `/mission`, `/chat`†, `/supapara`† |

† structure-only skeleton; not interactive.

## Source layout (for reference)

```
~/second-brain-hub/
├── app/
│   ├── page.tsx              # private home (BrainBrief, DailyCard, etc.)
│   ├── chat/                 # chat surface
│   ├── mission/              # War Room
│   ├── supapara/             # embedded SupaPara HQ
│   └── settings/
├── components/               # nav, theme, brain, mission, supapara, ui
├── lib/                      # api, mission, mission-derive, sse, use-agent-chat
├── server/                   # FastAPI app — imports from ~/aidre/lib/
└── scripts/start.sh          # launches both processes
```

The demo repo (this one) keeps the same `components/`, the same `lib/mission*`
types, and the same `app/(app)/mission/page.tsx` — but drops `server/`,
swaps the data layer, and adds a marketing landing page.
