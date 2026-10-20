const STEPS = [
  {
    n: "01",
    title: "Patient verification",
    body: "The patient joins the video room. Apollo HIS matches their record and confirms consent — all on camera, all logged.",
    tag: "HIS Matched",
  },
  {
    n: "02",
    title: "Visual assessment",
    body: "The specialist sees the patient, their meal, a label or a report through the camera and responds to what's actually in frame.",
    tag: "Seen on camera",
  },
  {
    n: "03",
    title: "Live guidance",
    body: "Face-to-face, the avatar walks through a grounding exercise or a diet swap — interruptible, natural, 24 FPS lip-synced.",
    tag: "Two-way video",
  },
  {
    n: "04",
    title: "Clinical plan",
    body: "A structured CBT summary or therapeutic diet chart is generated and written back to the EHR as the conversation happens.",
    tag: "Diet Chart Generated",
  },
  {
    n: "05",
    title: "Safe handoff",
    body: "On any red flag, the Care Coordination Hub is notified and a human clinician is looped in with the full session context.",
    tag: "Care Hub Notified",
  },
  {
    n: "06",
    title: "Follow-up",
    body: "The patient gets a plain-language summary and next steps on WhatsApp before they've left the call.",
    tag: "WhatsApp Follow-up Sent",
  },
];

export function Journey() {
  return (
    <section id="journey" className="scroll-mt-20 bg-bg-soft">
      <div className="mx-auto max-w-[1200px] px-[var(--gutter)] py-20">
        <div className="max-w-2xl">
          <span className="pill bg-navy-50 text-navy">How a session works</span>
          <h2 className="mt-4 text-[34px] font-extrabold leading-tight tracking-tight text-ink sm:text-[40px]">
            One video session, end to end
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            From the first hello to the follow-up message, every step is live,
            visible and written back to the systems your hospital already runs.
          </p>
        </div>

        <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="relative rounded-2xl border border-line bg-white p-6 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[26px] font-extrabold text-navy/25">
                  {s.n}
                </span>
                <span className="pill bg-navy-50 text-navy">{s.tag}</span>
              </div>
              <h3 className="mt-3 text-[17px] font-bold text-ink">{s.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
