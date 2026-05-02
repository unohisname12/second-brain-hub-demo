import type { HiveNote, MissionAgent, MissionTask, ToolActivity } from "@/lib/mission";

export const DEMO_AGENTS: MissionAgent[] = [
  {
    id: "architect",
    name: "Architect",
    role: "supervisor",
    persona: "Plans work, delegates to specialists, maintains the long view.",
    tool_allowlist: ["vault.search", "notes.write", "delegate"],
    model_tier: "reason",
    runtime: "gemini",
    enabled: true,
  },
  {
    id: "scout",
    name: "Scout",
    role: "search",
    persona: "Fast retrieval over the vault and the web.",
    tool_allowlist: ["vault.search", "web.fetch", "summarize"],
    model_tier: "fast",
    runtime: "ollama",
    enabled: true,
  },
  {
    id: "scribe",
    name: "Scribe",
    role: "notes",
    persona: "Writes summaries, decisions, and next steps to the hive.",
    tool_allowlist: ["notes.write", "vault.write"],
    model_tier: "general",
    runtime: "ollama",
    enabled: true,
  },
  {
    id: "runner",
    name: "Runner",
    role: "code",
    persona: "Executes code tasks via Claude Code.",
    tool_allowlist: ["repo.read", "repo.write", "shell"],
    model_tier: "code",
    runtime: "claude_code",
    enabled: true,
  },
];

export type TaskTemplate = {
  id: string;
  title: string;
  description: string;
  agent_id: string;
};

export const TASK_TEMPLATES: TaskTemplate[] = [
  { id: "t-summary",   title: "Summarize the last week of vault edits",   description: "Pull recent edits, group by topic, write 1-paragraph digest.", agent_id: "scout"     },
  { id: "t-outline",   title: "Draft outline for blog post on local-first AI", description: "Pull notes tagged #local-first, propose 5-section outline.", agent_id: "scribe" },
  { id: "t-index",     title: "Re-index new vault entries",               description: "Detect notes added in the last 24h, update embeddings.",       agent_id: "scout"   },
  { id: "t-research",  title: "Compare Ollama vs llama.cpp throughput",    description: "Fetch latest benchmarks, summarize tradeoffs.",                agent_id: "scout"   },
  { id: "t-decision",  title: "Decide retention policy for chat history",  description: "Summarize options, draft decision record.",                    agent_id: "architect" },
  { id: "t-cleanup",   title: "Clean up duplicate hive notes",            description: "Find near-duplicate notes, propose merges.",                    agent_id: "scribe" },
  { id: "t-followup",  title: "Open follow-up task for stalled migration", description: "Read decision record, draft new task.",                       agent_id: "architect" },
  { id: "t-refactor",  title: "Refactor mission-derive helpers",           description: "Extract shared regexes, add tests.",                           agent_id: "runner"  },
  { id: "t-typecheck", title: "Run typecheck across workspace",            description: "pnpm tsc --noEmit, report errors.",                           agent_id: "runner"  },
  { id: "t-archive",   title: "Archive notes older than 1 year",          description: "Move to 99-Archive, preserve backlinks.",                      agent_id: "scribe"  },
  { id: "t-search",    title: "Improve search ranking for short queries",  description: "Tune BM25 + embedding mix.",                                   agent_id: "scout"   },
  { id: "t-export",    title: "Export weekly digest to markdown",         description: "Roll up summaries, write to vault.",                            agent_id: "scribe"  },
];

export type ToolTemplate = { agent_id: string; summary: string; kind: "call" | "result" };

export const TOOL_TEMPLATES: ToolTemplate[] = [
  { agent_id: "scout",     kind: "call",   summary: "vault.search(\"local-first AI\", limit=8)" },
  { agent_id: "scout",     kind: "result", summary: "vault.search → 8 hits, top distance 0.21" },
  { agent_id: "scout",     kind: "call",   summary: "web.fetch(\"https://ggml.ai/benchmarks\")" },
  { agent_id: "scout",     kind: "result", summary: "web.fetch → 14kb html, 320 words after extract" },
  { agent_id: "scout",     kind: "call",   summary: "summarize(input=320 words, target=80)" },
  { agent_id: "scout",     kind: "result", summary: "summarize → 78 words" },
  { agent_id: "scribe",    kind: "call",   summary: "notes.write(kind=summary, length=78)" },
  { agent_id: "scribe",    kind: "result", summary: "notes.write → hive_note id=hn_4f2" },
  { agent_id: "scribe",    kind: "call",   summary: "vault.write(path=\"weekly/2026-W18.md\")" },
  { agent_id: "scribe",    kind: "result", summary: "vault.write → 1.2kb saved" },
  { agent_id: "architect", kind: "call",   summary: "delegate(to=\"scout\", task=\"t-research\")" },
  { agent_id: "architect", kind: "result", summary: "delegate → accepted by scout" },
  { agent_id: "architect", kind: "call",   summary: "notes.write(kind=decision, length=140)" },
  { agent_id: "architect", kind: "result", summary: "notes.write → hive_note id=hn_5a1" },
  { agent_id: "runner",    kind: "call",   summary: "repo.read(\"lib/mission-derive.ts\")" },
  { agent_id: "runner",    kind: "result", summary: "repo.read → 102 lines" },
  { agent_id: "runner",    kind: "call",   summary: "shell(\"pnpm tsc --noEmit\")" },
  { agent_id: "runner",    kind: "result", summary: "shell → exit 0, 0 errors" },
  { agent_id: "runner",    kind: "call",   summary: "repo.write(\"lib/mission-derive.test.ts\")" },
  { agent_id: "runner",    kind: "result", summary: "repo.write → 48 lines added" },
  { agent_id: "scout",     kind: "call",   summary: "vault.search(\"retention policy\", limit=5)" },
  { agent_id: "scout",     kind: "result", summary: "vault.search → 5 hits" },
  { agent_id: "scribe",    kind: "call",   summary: "notes.write(kind=next_step)" },
  { agent_id: "scribe",    kind: "result", summary: "notes.write → hive_note id=hn_6c0" },
  { agent_id: "scout",     kind: "call",   summary: "vault.search(\"duplicates\", limit=20)" },
  { agent_id: "scout",     kind: "result", summary: "vault.search → 12 candidate pairs" },
  { agent_id: "scribe",    kind: "call",   summary: "notes.write(kind=log)" },
  { agent_id: "scribe",    kind: "result", summary: "notes.write → hive_note id=hn_7e3" },
  { agent_id: "runner",    kind: "call",   summary: "shell(\"pnpm lint\")" },
  { agent_id: "runner",    kind: "result", summary: "shell → exit 0, 0 warnings" },
];

export type HiveTemplate = { agent_id: string; kind: HiveNote["kind"]; content: string };

export const HIVE_TEMPLATES: HiveTemplate[] = [
  { agent_id: "scout",     kind: "summary",   content: "Found 8 vault entries on local-first AI; common themes: ownership, latency, cost." },
  { agent_id: "architect", kind: "decision",  content: "Going with Ollama for fast tier; Gemini reserved for reasoning runs." },
  { agent_id: "scribe",    kind: "next_step", content: "Draft section 2 of blog post — \"Why local-first?\"" },
  { agent_id: "scribe",    kind: "log",       content: "tool_call: notes.write kind=summary length=78" },
  { agent_id: "scout",     kind: "summary",   content: "Benchmarks: llama.cpp ~1.4× faster on M-series; Ollama wins on ergonomics." },
  { agent_id: "architect", kind: "decision",  content: "Retention: keep 90 days of chat history, then summarize and discard." },
  { agent_id: "scribe",    kind: "next_step", content: "Open follow-up task: implement chat-history summarizer." },
  { agent_id: "runner",    kind: "log",       content: "tool_call: shell pnpm tsc --noEmit" },
  { agent_id: "scout",     kind: "summary",   content: "12 duplicate-pair candidates identified; awaiting scribe merge proposals." },
  { agent_id: "scribe",    kind: "log",       content: "tool_call: vault.write path=weekly/2026-W18.md" },
];
