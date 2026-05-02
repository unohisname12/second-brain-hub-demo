// app/(app)/chat/page.tsx
import { DemoBanner } from "@/components/demo/demo-banner";

export default function ChatPage() {
  return (
    <DemoBanner
      title="Chat"
      body="Local Ollama for fast turns; Gemini Deep Mode for long reasoning runs. Conversations stream over SSE; tool calls show inline."
    />
  );
}
