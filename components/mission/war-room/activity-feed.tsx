"use client";

import {
  Circle,
  FileEdit,
  GitCompare,
  Save,
  Search,
  Send,
} from "lucide-react";

import type { HiveNote, MissionAgent } from "@/lib/mission";
import { type ActivityEvent, mapHiveToActivity } from "@/lib/mission-derive";

const ICON_BY_NAME: Record<string, React.ComponentType<{ className?: string }>> = {
  search: Search,
  save: Save,
  "file-edit": FileEdit,
  "git-compare": GitCompare,
  send: Send,
};

export function ActivityFeed({
  notes,
  agents,
  nowSec,
}: {
  notes: HiveNote[];
  agents: MissionAgent[];
  nowSec: number;
}) {
  const events: ActivityEvent[] = notes.map((n) => mapHiveToActivity(n, agents));
  const oldestSec = notes.length
    ? nowSec - notes[notes.length - 1].created_at
    : 0;
  const window = oldestSec < 60 ? `${oldestSec}s` : `${Math.floor(oldestSec / 60)} min`;

  return (
    <aside className="wr-activity">
      <div className="wr-panel-head">
        <span className="wr-panel-title">LIVE ACTIVITY</span>
        <span className="wr-panel-sub">last {window}</span>
      </div>
      <div className="wr-feed">
        {events.length === 0 ? (
          <div className="text-xs text-muted py-2">No recent activity.</div>
        ) : (
          events.map((e) => {
            const Icon = ICON_BY_NAME[e.iconName] ?? Circle;
            return (
              <div key={e.noteId} className={`wr-event wr-k-${e.kind}`}>
                <div className="wr-event-time">{e.t}</div>
                <div className="wr-event-icon">
                  <Icon className="h-[10px] w-[10px]" />
                </div>
                <div className="wr-event-body">
                  <div className="wr-event-meta">
                    <span className="wr-event-agent">{e.agentName}</span>
                    <span>·</span>
                    <span>{e.kind}</span>
                  </div>
                  <div className="wr-event-text">{e.text}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
