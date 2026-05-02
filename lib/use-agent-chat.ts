"use client";

import { useCallback, useState } from "react";
import type { Turn } from "@/components/mission/war-room/chat-stage";

export function useAgentChat() {
  const [turns] = useState<Turn[]>([]);
  const [streaming] = useState(false);

  const send = useCallback(async (_text: string) => {
    // No-op in demo mode — chat is described as "live in the private build."
  }, []);

  const stop = useCallback(() => {
    // No-op
  }, []);

  return { turns, streaming, send, stop };
}
