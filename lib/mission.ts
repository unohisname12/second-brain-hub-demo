export type TaskStatus = "queued" | "live" | "done" | "failed";
export type HiveKind = "summary" | "decision" | "next_step" | "log";
export type ModelTier = "code" | "reason" | "general" | "fast";
export type AgentRuntime = "gemini" | "ollama" | "claude_code";

export type MissionAgent = {
  id: string;
  name: string;
  role: string;
  persona: string;
  tool_allowlist: string[];
  model_tier: ModelTier;
  runtime: AgentRuntime;
  enabled: boolean;
};

export type MissionTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number;
  agent_id: string | null;
  result_summary: string | null;
  created_at: number;
  updated_at: number;
  started_at: number | null;
  finished_at: number | null;
};

export type HiveNote = {
  id: string;
  task_id: string | null;
  agent_id: string | null;
  kind: HiveKind;
  content: string;
  created_at: number;
};

export type MissionEvent = {
  id: string;
  type: string;
  task_id: string | null;
  agent_id: string | null;
  payload: Record<string, unknown>;
  created_at: number;
};

export type AutonomyStatus = {
  enabled: boolean;
  status: "paused" | "idle" | "processing" | "error" | string;
  active_task_id: string | null;
  last_heartbeat: number | null;
  last_error: string | null;
  max_concurrent: number;
  max_tasks_per_hour: number;
  recent_claims?: number;
  rate_limit_window_seconds?: number;
  rate_limit_resets_at?: number | null;
  rate_limit_cleared_at?: number | null;
  loop_running: boolean;
  recent_events: MissionEvent[];
};

export type Dashboard = {
  agents: MissionAgent[];
  active_tasks: MissionTask[];
  recent_hive: HiveNote[];
  counts: Record<TaskStatus, number>;
  autonomy?: AutonomyStatus;
};

export type ToolActivity = {
  kind: "call" | "result";
  id: string;
  task_id: string | null;
  agent_id: string | null;
  summary: string;
  created_at: number;
};

export const TASK_STATUSES: TaskStatus[] = ["queued", "live", "done", "failed"];

export const STATUS_COLOR: Record<TaskStatus, string> = {
  queued: "text-muted bg-bg/40",
  live: "text-accent bg-accent/10",
  done: "text-emerald-400 bg-emerald-500/10",
  failed: "text-rose-400 bg-rose-500/10",
};

export const KIND_COLOR: Record<HiveKind, string> = {
  summary: "text-sky-400",
  decision: "text-amber-400",
  next_step: "text-violet-400",
  log: "text-muted",
};

export function relTime(ts: number): string {
  const ms = Date.now() - ts * 1000;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
