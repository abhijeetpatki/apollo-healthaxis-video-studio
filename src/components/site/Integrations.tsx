import { Camera, Sparkle, Hospital, Notes, Users, Chat, ArrowRight } from "@/components/icons";

const TARGETS = [
  { icon: Hospital, name: "HIS / EHR", desc: "Patient match & clinical notes" },
  { icon: Users, name: "CRM", desc: "Patient relationship & history" },
  { icon: Notes, name: "Care Coordination Hub", desc: "Human clinician handoff" },
  { icon: Chat, name: "SMS & WhatsApp", desc: "Summaries & reminders" },
];

export function Integrations() {
  return (
    <section id="integrations" className="scroll-mt-20 bg-white">
      <div className="mx-auto max-w-[1200px] px-[var(--gutter)] py-20">
        <div className="max-w-2xl">
          <span className="pill bg-navy-50 text-navy">Integrations</span>
          <h2 className="mt-4 text-[34px] font-extrabold leading-tight tracking-tight text-ink sm:text-[40px]">
            Connected to the systems you already run
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            The video avatar isn&apos;t a silo. Patient camera and mic flow into
            the Apollo Live Avatar, and every clinical action flows straight back
            into your hospital stack.
          </p>
        </div>

        <div className="mt-12 rounded-3xl border border-line bg-bg-soft p-6 sm:p-10">
          <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1.3fr)]">
            {/* source */}
            <PipeCard
              icon={Camera}
              title="Patient Camera & Mic"
              desc="16 kHz audio · 1 FPS video"
              tone="navy"
            />
            <Connector />
            {/* brain */}
            <PipeCard
              icon={Sparkle}
              title="Apollo Live Avatar"
              desc="Two-way video · VIDEO output"
              tone="accent"
              highlight
            />
            <Connector />
            {/* targets */}
            <div className="grid grid-cols-2 gap-3">
              {TARGETS.map((t) => (
                <div
                  key={t.name}
                  className="rounded-xl border border-line bg-white p-3.5"
                >
                  <t.icon size={20} className="text-navy" />
                  <p className="mt-2 text-[13px] font-semibold text-ink">
                    {t.name}
                  </p>
                  <p className="text-[11.5px] leading-snug text-muted">
                    {t.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Connector() {
  return (
    <div className="flex items-center justify-center text-line-2 max-lg:rotate-90">
      <ArrowRight size={26} />
    </div>
  );
}

function PipeCard({
  icon: Icon,
  title,
  desc,
  tone,
  highlight,
}: {
  icon: (p: { size?: number; className?: string }) => React.ReactNode;
  title: string;
  desc: string;
  tone: "navy" | "accent";
  highlight?: boolean;
}) {
  const grad =
    tone === "navy"
      ? "linear-gradient(145deg,#1d6882,#154e62)"
      : "linear-gradient(145deg,#d97706,#b45309)";
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-transparent text-white shadow-[var(--shadow-float)]"
          : "border-line bg-white"
      }`}
      style={highlight ? { background: grad } : undefined}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          highlight ? "bg-white/20 text-white" : "bg-navy-50 text-navy"
        }`}
      >
        <Icon size={22} />
      </div>
      <p
        className={`mt-3 text-[15px] font-bold ${highlight ? "text-white" : "text-ink"}`}
      >
        {title}
      </p>
      <p
        className={`text-[12.5px] ${highlight ? "text-white/80" : "text-muted"}`}
      >
        {desc}
      </p>
    </div>
  );
}
