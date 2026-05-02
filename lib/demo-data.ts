import {
  buildDashboard,
  getDoneTasks,
  getStoreSnapshot,
  setAutonomy,
} from "@/lib/demo-store";
import type {
  AutonomyStatus,
  Dashboard,
  HiveNote,
  MissionTask,
  TaskStatus,
  ToolActivity,
} from "@/lib/mission";

export async function getDashboard(): Promise<Dashboard> {
  return buildDashboard();
}

export async function getTasks(
  status?: TaskStatus,
): Promise<{ tasks: MissionTask[] }> {
  const s = getStoreSnapshot();
  if (status === "done") return { tasks: getDoneTasks() };
  if (status) return { tasks: s.active_tasks.filter((t) => t.status === status) };
  return { tasks: s.active_tasks };
}

export async function getToolActivity(opts?: {
  taskId?: string;
  limit?: number;
}): Promise<{ tools: ToolActivity[] }> {
  const s = getStoreSnapshot();
  let tools = s.tool_activity;
  if (opts?.taskId) tools = tools.filter((t) => t.task_id === opts.taskId);
  if (opts?.limit) tools = tools.slice(0, opts.limit);
  return { tools };
}

export async function getHive(taskId?: string): Promise<{ notes: HiveNote[] }> {
  const s = getStoreSnapshot();
  const notes = taskId ? s.recent_hive.filter((n) => n.task_id === taskId) : s.recent_hive;
  return { notes };
}

export async function pauseAutonomy(): Promise<AutonomyStatus> {
  const s = getStoreSnapshot();
  const cur = s.autonomy ?? defaultAutonomy();
  const next: AutonomyStatus = { ...cur, status: "paused" };
  setAutonomy(next);
  return next;
}

export async function resumeAutonomy(): Promise<AutonomyStatus> {
  const s = getStoreSnapshot();
  const cur = s.autonomy ?? defaultAutonomy();
  const next: AutonomyStatus = { ...cur, status: "processing" };
  setAutonomy(next);
  return next;
}

export async function clearAutonomyRateLimit(): Promise<AutonomyStatus> {
  const s = getStoreSnapshot();
  const cur = s.autonomy ?? defaultAutonomy();
  const next: AutonomyStatus = { ...cur, rate_limit_cleared_at: Math.floor(Date.now() / 1000) };
  setAutonomy(next);
  return next;
}

export async function openClaudeSession(
  taskId: string,
  _body?: { reason?: string; detail?: string },
): Promise<{ ok: boolean; task_id: string; prompt_path: string; run_path: string; terminal: string }> {
  return {
    ok: true,
    task_id: taskId,
    prompt_path: "demo://prompt",
    run_path: "demo://run",
    terminal: "demo://terminal",
  };
}

function defaultAutonomy(): AutonomyStatus {
  return {
    enabled: true,
    status: "idle",
    active_task_id: null,
    last_heartbeat: Math.floor(Date.now() / 1000),
    last_error: null,
    max_concurrent: 2,
    max_tasks_per_hour: 30,
    loop_running: true,
    recent_events: [],
  };
}
