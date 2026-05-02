"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import type { MissionAgent, MissionTask } from "@/lib/mission";

function WarTaskRow({
  t,
  group,
  agents,
}: {
  t: MissionTask;
  group: "active" | "queued" | "done";
  agents: MissionAgent[];
}) {
  const ag = t.agent_id ? agents.find((a) => a.id === t.agent_id) : null;
  return (
    <Link href={`/mission/tasks/${t.id}`} className={`wr-task wr-task-${group} block hover:bg-bg/30`}>
      <div className="wr-task-marker" />
      <div className="wr-task-body">
        <div className="wr-task-title">{t.title}</div>
        <div className="wr-task-meta">{ag ? ag.name.toLowerCase() : "unassigned"}</div>
      </div>
    </Link>
  );
}

export function TaskPanel({
  active,
  queued,
  done,
  agents,
}: {
  active: MissionTask[];
  queued: MissionTask[];
  done: MissionTask[];
  agents: MissionAgent[];
}) {
  return (
    <aside className="wr-tasks">
      <div className="wr-panel-head">
        <span className="wr-panel-title">TASKS</span>
        <span className="wr-panel-sub">
          {active.length} · {queued.length} · {done.length}
          <Link
            href="/mission/legacy"
            title="Create a task (uses legacy form for now)"
            className="ml-3 inline-flex items-center text-muted hover:text-fg"
          >
            <Plus className="h-3 w-3" />
          </Link>
        </span>
      </div>
      <div className="wr-task-group">
        <div className="wr-group-label">ACTIVE</div>
        {active.length === 0 ? (
          <div className="text-xs text-muted py-1">none</div>
        ) : (
          active.map((t) => <WarTaskRow key={t.id} t={t} group="active" agents={agents} />)
        )}
      </div>
      <div className="wr-task-group">
        <div className="wr-group-label">QUEUED</div>
        {queued.length === 0 ? (
          <div className="text-xs text-muted py-1">none</div>
        ) : (
          queued.map((t) => <WarTaskRow key={t.id} t={t} group="queued" agents={agents} />)
        )}
      </div>
      <div className="wr-task-group">
        <div className="wr-group-label">DONE</div>
        {done.length === 0 ? (
          <div className="text-xs text-muted py-1">none</div>
        ) : (
          done.map((t) => <WarTaskRow key={t.id} t={t} group="done" agents={agents} />)
        )}
      </div>
    </aside>
  );
}
