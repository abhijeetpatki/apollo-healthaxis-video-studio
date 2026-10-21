import Link from "next/link";
import { ApolloLogo } from "@/components/brand/Logo";
import { ArrowRight } from "@/components/icons";
import { AdminButton } from "@/components/admin/AdminButton";

const NAV = [
  { href: "#studio", label: "Try it live" },
  { href: "#specialists", label: "Specialists" },
  { href: "#journey", label: "How a session works" },
  { href: "#integrations", label: "Integrations" },
  { href: "#trust", label: "Patient Trust" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-[var(--gutter)]">
        <Link href="#top" className="shrink-0">
          <ApolloLogo />
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-[14px] font-medium text-ink-2 transition-colors hover:text-navy"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <AdminButton />
          <a
            href="#studio"
            className="inline-flex items-center gap-1.5 rounded-[10px] bg-navy px-4 py-2.5 text-[14px] font-semibold text-white shadow-[var(--shadow-card)] transition-colors hover:bg-navy-700"
          >
            Try it live
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}
