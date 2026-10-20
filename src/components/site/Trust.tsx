import { Shield, Users, Notes, Check } from "@/components/icons";

const GUARDRAILS = [
  {
    icon: Shield,
    title: "Clinical guardrails",
    body: "No diagnosis, no prescriptions. The avatar triages and supports, and knows its limits — red flags trigger an immediate escalation.",
  },
  {
    icon: Users,
    title: "Warm human handoff",
    body: "When a clinician is needed, the Care Coordination Hub receives the full session context so the patient never has to repeat themselves.",
  },
  {
    icon: Notes,
    title: "Consent & audit",
    body: "Every session opens with consent and closes with an auditable, structured note written back to the EHR. Patients can request deletion.",
  },
];

export function Trust() {
  return (
    <section id="trust" className="scroll-mt-20 bg-white">
      <div className="mx-auto max-w-[1200px] px-[var(--gutter)] py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <span className="pill bg-navy-50 text-navy">Patient trust</span>
            <h2 className="mt-4 text-[34px] font-extrabold leading-tight tracking-tight text-ink sm:text-[40px]">
              Built for patient trust
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              A face on screen raises the bar for safety, not lowers it. Apollo
              HealthAxis wraps Gemini 3.8 Live Avatar in the guardrails, consent
              and oversight that clinical care demands.
            </p>
            <div className="mt-6 rounded-2xl border border-line bg-bg-soft p-5">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ok/15 text-ok">
                  <Check size={13} />
                </span>
                Synthetic data disclosure
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                This studio is a demonstration. Avatars, voices and any patient
                details shown are synthetic. It is not a medical device and does
                not provide medical advice.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {GUARDRAILS.map((g) => (
              <div
                key={g.title}
                className="flex gap-4 rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy">
                  <g.icon size={22} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-ink">{g.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">
                    {g.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
