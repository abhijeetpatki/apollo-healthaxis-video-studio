import { ApolloLogo } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg-soft">
      <div className="mx-auto max-w-[1200px] px-[var(--gutter)] py-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <ApolloLogo />
            <p className="mt-4 text-[13.5px] leading-relaxed text-muted">
              Two-way AI video consultations for hospitals, powered by Gemini
              3.8 Live Avatar. Built with clinicians, for patient trust.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title="Product"
              links={["Video Studio", "Specialists", "Integrations", "Security"]}
            />
            <FooterCol
              title="Company"
              links={["About", "Clinicians", "Careers", "Contact"]}
            />
            <FooterCol
              title="Legal"
              links={["Privacy", "Consent", "Terms", "Responsible AI"]}
            />
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-[12.5px] text-muted sm:flex-row sm:items-center">
          <p>© 2026 Apollo HealthAxis. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="pill bg-navy-50 text-navy">Synthetic data</span>
            <span>
              Demonstration only — not a medical device and not a substitute for
              professional care.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-[13px] font-semibold text-ink">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-[13px] text-muted hover:text-navy">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
