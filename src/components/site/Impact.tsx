const STATS = [
  { value: "24 FPS", label: "Lip-synced avatar video", sub: "704×1280 portrait, 24 kHz audio" },
  { value: "< 500 ms", label: "Perceived response latency", sub: "with native barge-in" },
  { value: "2", label: "Specialist video rooms", sub: "counselling + dietetics" },
  { value: "100%", label: "Sessions written to EHR", sub: "structured, auditable notes" },
];

export function Impact() {
  return (
    <section id="impact" className="scroll-mt-20 bg-bg-soft">
      <div className="mx-auto max-w-[1200px] px-[var(--gutter)] py-20">
        <div className="max-w-2xl">
          <span className="pill bg-navy-50 text-navy">Impact</span>
          <h2 className="mt-4 text-[34px] font-extrabold leading-tight tracking-tight text-ink sm:text-[40px]">
            Face-to-face care, at the scale of software
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            Extend your specialists&apos; reach without extending their hours —
            and keep every interaction clinical-grade, consented and on record.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-line bg-white p-6 shadow-[var(--shadow-card)]"
            >
              <p className="text-[32px] font-extrabold tracking-tight text-navy">
                {s.value}
              </p>
              <p className="mt-1 text-[14.5px] font-semibold text-ink">
                {s.label}
              </p>
              <p className="mt-1 text-[12.5px] text-muted">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
