import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function base(size = 20, props: SVGProps<SVGSVGElement> = {}) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export const Mic = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
);
export const MicOff = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M9 9v2a3 3 0 0 0 4.5 2.6M15 11V6a3 3 0 0 0-6-.3" />
    <path d="M5 11a7 7 0 0 0 10 6.3M12 18v3M4 4l16 16" />
  </svg>
);
export const Video = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
    <path d="m15.5 10 6-3.2v10.4l-6-3.2" />
  </svg>
);
export const VideoOff = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M15.5 10V8.5A2.5 2.5 0 0 0 13 6H6.5M2.6 6.6A2.5 2.5 0 0 0 2.5 8.5v7A2.5 2.5 0 0 0 5 18h8a2.5 2.5 0 0 0 2.2-1.3" />
    <path d="m15.5 10 6-3.2v10.4l-3-1.6M3 3l18 18" />
  </svg>
);
export const PhoneOff = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M10.7 14.3a11 11 0 0 1-2.4-3.5l1.6-1.6a1.5 1.5 0 0 0 .3-1.7L8.9 4.6A1.5 1.5 0 0 0 7.3 3.7l-2.8.5A1.6 1.6 0 0 0 3.3 6 17 17 0 0 0 7 13M13 16.4a17 17 0 0 0 5 2.6 1.6 1.6 0 0 0 1.8-1.1l.5-2.8a1.5 1.5 0 0 0-.9-1.6l-2.9-1.3a1.5 1.5 0 0 0-1.5.2M3 3l18 18" />
  </svg>
);
export const Play = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M7 4.5v15l12-7.5-12-7.5Z" fill="currentColor" stroke="none" />
  </svg>
);
export const Sparkle = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <path d="M12 7c.6 2.7 2.3 4.4 5 5-2.7.6-4.4 2.3-5 5-.6-2.7-2.3-4.4-5-5 2.7-.6 4.4-2.3 5-5Z" fill="currentColor" stroke="none" />
  </svg>
);
export const Shield = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
export const Heart = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
  </svg>
);
export const Leaf = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M4 20c0-8 6-14 16-14 0 10-6 16-14 16" />
    <path d="M9 15c2-3 5-5 9-6" />
  </svg>
);
export const ArrowRight = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const Check = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
);
export const Hospital = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M4 21V7l8-4 8 4v14" />
    <path d="M9 21v-5h6v5M12 8v4M10 10h4" />
  </svg>
);
export const Notes = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M9 8h6M9 12h6M9 16h4" />
  </svg>
);
export const Chat = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M4 5h16v11H9l-5 4V5Z" />
  </svg>
);
export const Users = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5M15 20a6 6 0 0 0-1.5-4" />
  </svg>
);
export const Camera = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13" r="3.2" />
  </svg>
);
export const Gear = ({ size, ...p }: P) => (
  <svg {...base(size, p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </svg>
);
export const Dot = ({ size = 10, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden="true" {...p}>
    <circle cx="5" cy="5" r="5" fill="currentColor" />
  </svg>
);
