// components/demo/demo-banner.tsx
const RED = "rgba(232,69,69,1)";
const RED_SOFT = "rgba(232,69,69,0.08)";
const RED_BORDER = "rgba(232,69,69,0.4)";

export function DemoBanner({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div
        className="rounded-lg border p-6"
        style={{ borderColor: RED_BORDER, backgroundColor: RED_SOFT }}
      >
        <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: RED }}>
          Demo mode — structure only
        </div>
        <h1 className="text-xl font-semibold mb-2">{title}</h1>
        <p className="text-sm text-muted mb-3">{body}</p>
        <p className="text-xs text-muted italic">
          Live in the private build; not exposed in this demo.
        </p>
      </div>
    </div>
  );
}
