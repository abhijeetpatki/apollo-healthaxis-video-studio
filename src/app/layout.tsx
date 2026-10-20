import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Apollo HealthAxis — AI Video Consultation Studio",
  description:
    "Two-way AI video consultations powered by Gemini 3.8 Live Avatar. Talk face-to-face with Apollo HealthAxis specialists — psychological counselling and clinical dietetics — in real time.",
  metadataBase: new URL("https://apollo-healthaxis-video-studio.vercel.app"),
  openGraph: {
    title: "Apollo HealthAxis — AI Video Consultation Studio",
    description:
      "Real-time two-way video consultations with AI specialists, powered by Gemini 3.8 Live Avatar.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-bg text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
