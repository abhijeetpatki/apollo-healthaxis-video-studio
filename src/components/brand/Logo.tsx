import type { SVGProps } from "react";

/** Clean SVG recreation of the Apollo HealthAxis mark (teal "axis" caduceus-cross). */
export function ApolloMark({
  size = 34,
  ...props
}: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <rect width="48" height="48" rx="12" fill="url(#ax-mark-g)" />
      <path
        d="M24 10.5c-4.2 2.6-8.4 3.4-11.5 3.4 0 10.9 4.1 18.1 11.5 21.6 7.4-3.5 11.5-10.7 11.5-21.6-3.1 0-7.3-.8-11.5-3.4Z"
        fill="#fff"
        fillOpacity="0.16"
      />
      <path
        d="M24 14v20M24 14v20M17 20.5l7 3.8 7-3.8M17 27l7 3.8 7-3.8"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="14" r="2.6" fill="#fff" />
      <defs>
        <linearGradient
          id="ax-mark-g"
          x1="4"
          y1="4"
          x2="44"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2582a1" />
          <stop offset="1" stopColor="#154e62" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ApolloLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <ApolloMark size={34} />
      <span className="flex flex-col leading-none">
        <span className="text-[17px] font-extrabold tracking-tight text-ink">
          Apollo <span className="text-navy">HealthAxis</span>
        </span>
        <span className="mt-0.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">
          AI Video Studio
        </span>
      </span>
    </span>
  );
}
