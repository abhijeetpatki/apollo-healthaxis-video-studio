import { PERSONA_ORDER, PERSONAS } from "@/lib/personas";
import { Check, Heart, Leaf } from "@/components/icons";

export function Specialists() {
  return (
    <section id="specialists" className="scroll-mt-20 bg-white">
      <div className="mx-auto max-w-[1200px] px-[var(--gutter)] py-20">
        <div className="max-w-2xl">
          <span className="pill bg-navy-50 text-navy">Two video rooms</span>
          <h2 className="mt-4 text-[34px] font-extrabold leading-tight tracking-tight text-ink sm:text-[40px]">
            Meet the specialists behind the camera
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            Each specialist is a dedicated Gemini 3.8 Live Avatar room — a real
            face and voice that can see what you show, remember the thread of
            the conversation, and act through Apollo&apos;s hospital systems.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {PERSONA_ORDER.map((id) => {
            const p = PERSONAS[id];
            const isNavy = p.accent === "navy";
            const Icon = id === "counsellor" ? Heart : Leaf;
            return (
              <div
                key={id}
                className="group relative overflow-hidden rounded-2xl border border-line bg-white p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-float)]"
              >
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{
                    background: `linear-gradient(90deg, ${p.portrait.from}, ${p.portrait.to})`,
                  }}
                />
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white"
                    style={{
                      background: `linear-gradient(145deg, ${p.portrait.from}, ${p.portrait.to})`,
                    }}
                  >
                    <Icon size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`pill ${isNavy ? "bg-navy-50 text-navy" : "bg-[#fdf2e2] text-accent-700"}`}
                      >
                        {p.gender === "male" ? "Male avatar" : "Female avatar"} ·{" "}
                        {p.avatarName}
                      </span>
                    </div>
                    <h3 className="mt-2 text-[20px] font-bold text-ink">
                      {p.name}
                    </h3>
                    <p className="text-[13.5px] font-medium text-muted">
                      {p.role}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-[14.5px] leading-relaxed text-ink-2">
                  {p.tagline}
                </p>

                <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {p.specialties.map((s) => (
                    <li
                      key={s}
                      className="flex items-center gap-2 text-[13.5px] text-ink-2"
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full ${isNavy ? "bg-navy-50 text-navy" : "bg-[#fdf2e2] text-accent-700"}`}
                      >
                        <Check size={13} />
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                  <span className="text-[12.5px] text-muted">
                    Voice · <span className="font-semibold text-ink-2">{p.voiceName}</span>
                  </span>
                  <a
                    href="#studio"
                    className={`text-[13.5px] font-semibold ${isNavy ? "text-navy" : "text-accent-700"} hover:underline`}
                  >
                    Start a session →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
