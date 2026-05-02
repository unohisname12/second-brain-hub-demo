"use client";

import {
  Activity,
  Bot,
  Brain,
  FileText,
  GraduationCap,
  Radar,
  Search,
  Wrench,
} from "lucide-react";

import type { MissionAgent } from "@/lib/mission";
import type { AgentStatus } from "@/lib/mission-derive";

const ICON_BY_NAME: Record<string, React.ComponentType<{ className?: string }>> = {
  brain: Brain,
  wrench: Wrench,
  radar: Radar,
  activity: Activity,
  "graduation-cap": GraduationCap,
  "file-text": FileText,
  bot: Bot,
  search: Search,
};

export type AgentWithStatus = MissionAgent & { status: AgentStatus; iconName: string };

const STATUS_LABEL: Record<AgentStatus, string> = {
  idle: "idle",
  thinking: "thinking",
  working: "working",
  done: "done",
  error: "error",
};

function StatusDot({ status }: { status: AgentStatus }) {
  return <span className={`wr-dot wr-dot-${status}`} aria-label={STATUS_LABEL[status]} />;
}

function AgentChip({
  a,
  active,
  onClick,
}: {
  a: AgentWithStatus;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = ICON_BY_NAME[a.iconName] ?? Bot;
  return (
    <button
      type="button"
      className={`wr-agent ${active ? "active" : ""} s-${a.status}`}
      onClick={onClick}
      title={`${a.name} · ${a.role} · ${STATUS_LABEL[a.status]}`}
    >
      <span className="wr-agent-icon">
        <Icon className="h-[11px] w-[11px]" />
      </span>
      <span className="wr-agent-meta">
        <span className="wr-agent-name">{a.name}</span>
        <span className="wr-agent-role">{a.role.split(/[,/]/)[0].trim().toLowerCase()}</span>
      </span>
      <StatusDot status={a.status} />
    </button>
  );
}

export function AgentBar({
  agents,
  activeId,
  onSelect,
}: {
  agents: AgentWithStatus[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="wr-agent-bar">
      <div className="wr-bar-label">TEAM · {agents.length}</div>
      <div className="wr-agent-row">
        {agents.map((a) => (
          <AgentChip key={a.id} a={a} active={activeId === a.id} onClick={() => onSelect(a.id)} />
        ))}
      </div>
    </div>
  );
}
