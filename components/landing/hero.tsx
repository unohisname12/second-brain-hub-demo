import Link from "next/link";
import { ArrowRight, GitBranch } from "lucide-react";

const RED = "rgba(232,69,69,1)";
const RED_SOFT = "rgba(232,69,69,0.08)";
const RED_BORDER = "rgba(232,69,69,0.4)";

export function Hero() {
  return (
    <section
      className="px-8 py-24 md:py-32 max-w-5xl mx-auto"
      style={{
        backgroundImage: "radial-gradient(1100px 600px at 50% -10%, rgba(232,69,69,0.06), transparent 65%)",
      }}
    >
      <div className="flex items-center gap-2 mb-6">
        <span
          className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border"
          style={{ color: RED, borderColor: RED_BORDER, backgroundColor: RED_SOFT }}
        >
          Public Demo
        </span>
      </div>
      <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">
        My Second Brain — Mission Control
      </h1>
      <p className="text-lg md:text-xl text-muted mb-10 max-w-2xl">
        An AI command center for personal knowledge, tasks, and agents.
        Local-first, private by default, built for late-night thinking.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/mission"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-md font-medium transition-colors"
          style={{
            backgroundColor: RED,
            color: "white",
          }}
        >
          Enter the War Room
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="https://github.com/unohisname12/second-brain-hub-demo"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-border hover:bg-panel transition-colors"
        >
          <GitBranch className="h-4 w-4" />
          View on GitHub
        </Link>
      </div>
    </section>
  );
}
