import Link from "next/link";

export function Footer() {
  return (
    <footer className="px-8 py-10 border-t border-border max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
        <div>
          Built by Dre · Bremerton, WA
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/unohisname12/second-brain-hub-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-fg transition-colors"
          >
            GitHub
          </Link>
          <span
            className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded border"
            style={{
              color: "rgba(232,69,69,1)",
              borderColor: "rgba(232,69,69,0.5)",
              backgroundColor: "rgba(232,69,69,0.08)",
            }}
          >
            Demo
          </span>
        </div>
      </div>
    </footer>
  );
}
