import type { HiveNote, MissionAgent, MissionTask } from "@/lib/mission";

export type AgentStatus = "idle" | "thinking" | "working" | "done" | "error";

export type ActivityKind = "find" | "memory" | "edit" | "diff" | "send";

export type ActivityEvent = {
  t: string;
  agentName: string;
  kind: ActivityKind;
  text: string;
  iconName: string;
  noteId: string;
};

export type Delegation = { to: string; verb: string; target: string | null };

export function deriveAgentStatus(
  agent: MissionAgent,
  allTasks: MissionTask[],
  nowSec: number,
): AgentStatus {
  if (!agent.enabled) return "idle";
  const mine = allTasks.filter((t) => t.agent_id === agent.id);
  if (mine.some((t) => t.status === "live")) return "working";
  const finished = mine
    .filter((t) => t.finished_at !== null)
    .sort((a, b) => (b.finished_at ?? 0) - (a.finished_at ?? 0));
  const last = finished[0];
  if (!last || last.finished_at === null) return "idle";
  if (nowSec - last.finished_at > 60) return "idle";
  if (last.status === "done") return "done";
  if (last.status === "failed") return "error";
  return "idle";
}

const ROLE_ICON: Array<[RegExp, string]> = [
  [/supervisor|generalist|router/i, "brain"],
  [/code|repo|deploy/i, "wrench"],
  [/search|summariz|compare|research/i, "radar"],
  [/server|service|health|ops/i, "activity"],
  [/hq|kanban|student/i, "graduation-cap"],
  [/vault|notes|journal|memory/i, "file-text"],
];

export function agentIconForRole(role: string): string {
  for (const [re, name] of ROLE_ICON) if (re.test(role)) return name;
  return "bot";
}

const KIND_TO_ACTIVITY: Record<HiveNote["kind"], ActivityKind> = {
  summary: "find",
  decision: "memory",
  next_step: "edit",
  log: "diff",
};

const ACTIVITY_ICON: Record<ActivityKind, string> = {
  find: "search",
  memory: "save",
  edit: "file-edit",
  diff: "git-compare",
  send: "send",
};

export function mapHiveToActivity(
  note: HiveNote,
  agents: MissionAgent[],
): ActivityEvent {
  const d = new Date(note.created_at * 1000);
  const t = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  let text = note.content;
  let kind: ActivityKind = KIND_TO_ACTIVITY[note.kind];
  if (text.startsWith("tool_call:")) {
    text = text.slice("tool_call:".length).trim();
    kind = "edit";
  } else if (text.startsWith("tool_result:")) {
    text = text.slice("tool_result:".length).trim();
    kind = "edit";
  }

  const ag = note.agent_id ? agents.find((a) => a.id === note.agent_id) : null;
  const agentName = ag?.name ?? note.agent_id ?? "system";

  return { t, agentName, kind, text, iconName: ACTIVITY_ICON[kind], noteId: note.id };
}

const DELEG_RE = /delegating\s+(\S+)\s+to\s+([a-z][a-z0-9_-]*)(?:\s*[—–-]\s*([^.\n]+))?/gi;
const MENTION_RE = /@([a-z][a-z0-9_-]*)/gi;

export function parseDelegations(text: string): Delegation[] {
  const out: Delegation[] = [];
  for (const m of text.matchAll(DELEG_RE)) {
    out.push({ to: m[2].toLowerCase(), verb: m[1].toLowerCase(), target: m[3]?.trim() || null });
  }
  for (const m of text.matchAll(MENTION_RE)) {
    out.push({ to: m[1].toLowerCase(), verb: "mention", target: null });
  }
  return out;
}
