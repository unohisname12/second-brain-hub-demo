import {
  buildDashboard,
  getDoneTasks,
  pushHiveNote,
  pushToolActivity,
  resetStore,
  setActiveTasks,
  setAgents,
  setAutonomy,
  setDoneTasks,
  setRecentHive,
  setToolActivity,
} from "@/lib/demo-store";
import {
  DEMO_AGENTS,
  HIVE_TEMPLATES,
  TASK_TEMPLATES,
  TOOL_TEMPLATES,
} from "@/lib/demo-fixtures";
import type {
  HiveNote,
  MissionTask,
  TaskStatus,
  ToolActivity,
} from "@/lib/mission";

export type TimelinePhase =
  | "boot"
  | "run-up"
  | "delegation"
  | "deep-work"
  | "wrap"
  | "lull";

const LOOP_SECONDS = 90;

export function phaseAt(elapsedSec: number): TimelinePhase {
  const t = ((elapsedSec % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS;
  if (t < 5) return "boot";
  if (t < 15) return "run-up";
  if (t < 30) return "delegation";
  if (t < 60) return "deep-work";
  if (t < 80) return "wrap";
  return "lull";
}

let timer: ReturnType<typeof setInterval> | null = null;
let startedAt = 0;
let counter = 0;
let lastPhase: TimelinePhase | null = null;

function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}

function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

function makeTask(
  templateIdx: number,
  status: TaskStatus,
  startedOffset: number | null = null,
  finishedOffset: number | null = null,
): MissionTask {
  const tpl = TASK_TEMPLATES[templateIdx % TASK_TEMPLATES.length];
  const now = nowSec();
  return {
    id: nextId(tpl.id),
    title: tpl.title,
    description: tpl.description,
    status,
    priority: 0,
    agent_id: tpl.agent_id,
    result_summary: status === "done" ? "Demo run completed." : null,
    created_at: now - 60,
    updated_at: now,
    started_at: startedOffset !== null ? now + startedOffset : null,
    finished_at: finishedOffset !== null ? now + finishedOffset : null,
  };
}

function pushTool(idx: number, taskId: string | null = null): void {
  const tpl = TOOL_TEMPLATES[idx % TOOL_TEMPLATES.length];
  const t: ToolActivity = {
    id: nextId("tool"),
    kind: tpl.kind,
    agent_id: tpl.agent_id,
    task_id: taskId,
    summary: tpl.summary,
    created_at: nowSec(),
  };
  pushToolActivity(t);
}

function pushHive(idx: number, taskId: string | null = null): void {
  const tpl = HIVE_TEMPLATES[idx % HIVE_TEMPLATES.length];
  const n: HiveNote = {
    id: nextId("hn"),
    kind: tpl.kind,
    agent_id: tpl.agent_id,
    task_id: taskId,
    content: tpl.content,
    created_at: nowSec(),
  };
  pushHiveNote(n);
}

function seedBoot(): void {
  resetStore();
  setAgents(DEMO_AGENTS);
  setActiveTasks([
    makeTask(0, "queued"),
    makeTask(1, "queued"),
  ]);
  setDoneTasks([]);
  setRecentHive([]);
  setToolActivity([]);
  setAutonomy({
    enabled: true,
    status: "idle",
    active_task_id: null,
    last_heartbeat: nowSec(),
    last_error: null,
    max_concurrent: 2,
    max_tasks_per_hour: 30,
    loop_running: true,
    recent_events: [],
  });
}

function applyPhaseTransition(phase: TimelinePhase): void {
  if (phase === "boot") {
    seedBoot();
    return;
  }
  if (phase === "run-up") {
    const dash = buildDashboard();
    const tasks = dash.active_tasks.map((t, i) =>
      i < 2 ? { ...t, status: "live" as TaskStatus, started_at: nowSec() } : t,
    );
    setActiveTasks(tasks);
    if (dash.autonomy) {
      setAutonomy({
        ...dash.autonomy,
        status: "processing",
        active_task_id: tasks[0]?.id ?? null,
        last_heartbeat: nowSec(),
      });
    }
    return;
  }
  if (phase === "delegation") {
    const dash = buildDashboard();
    const [first, ...rest] = dash.active_tasks;
    if (first) {
      const finished: MissionTask = { ...first, status: "done", finished_at: nowSec() };
      setDoneTasks([finished, ...getDoneTasks()]);
      setActiveTasks([...rest, makeTask(2, "live", -2)]);
    }
    pushHive(1);
    return;
  }
  if (phase === "deep-work") {
    const dash = buildDashboard();
    setActiveTasks([...dash.active_tasks, makeTask(3, "live", -1)]);
    return;
  }
  if (phase === "wrap") {
    const dash = buildDashboard();
    const completed: MissionTask[] = dash.active_tasks.map((t) => ({
      ...t,
      status: "done" as TaskStatus,
      finished_at: nowSec(),
    }));
    setDoneTasks([...completed, ...getDoneTasks()]);
    setActiveTasks([]);
    pushHive(2);
    pushHive(3);
    return;
  }
  if (phase === "lull") {
    const dash = buildDashboard();
    if (dash.autonomy) {
      setAutonomy({ ...dash.autonomy, status: "idle", active_task_id: null });
    }
    return;
  }
}

function tick(): void {
  const elapsed = Math.floor(Date.now() / 1000) - startedAt;
  const phase = phaseAt(elapsed);
  const tWithinLoop = elapsed % LOOP_SECONDS;

  if (phase !== lastPhase) {
    applyPhaseTransition(phase);
    lastPhase = phase;
  }

  if (phase === "run-up" || phase === "deep-work") {
    if (tWithinLoop % 2 === 0) pushTool(elapsed);
    if (tWithinLoop % 4 === 0) pushHive(elapsed % HIVE_TEMPLATES.length);
  }
  if (phase === "delegation" && tWithinLoop % 3 === 0) {
    pushTool((elapsed + 10) % TOOL_TEMPLATES.length);
  }
}

export function startTimeline(): void {
  if (timer !== null) return;
  startedAt = Math.floor(Date.now() / 1000);
  counter = 0;
  lastPhase = null;
  seedBoot();
  tick();
  timer = setInterval(tick, 1000);
}

export function stopTimeline(): void {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}
