"use client";

import { Bot } from "lucide-react";

import type { MissionAgent } from "@/lib/mission";
import type { Delegation } from "@/lib/mission-derive";

export function DelegationBadge({
  d,
  agents,
}: {
  d: Delegation;
  agents: MissionAgent[];
}) {
  const ag = agents.find((a) => a.id === d.to);
  return (
    <span className="wr-deleg">
      <span className="wr-deleg-arrow">→</span>
      <span className="wr-deleg-icon">
        <Bot className="h-[10px] w-[10px]" />
      </span>
      <span className="wr-deleg-name">{ag?.name ?? d.to}</span>
      <span className="wr-deleg-verb">{d.verb}</span>
      {d.target && <span className="wr-deleg-target">{d.target}</span>}
    </span>
  );
}
