import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Resource Booking System | Sistem Tempahan Ruang & Peralatan",
  description:
    "Sistem Tempahan Ruang & Peralatan untuk pengurusan tempahan bilik perbincangan, makmal komputer serta peralatan studio dan sukan kampus.",
  openGraph: {
    title: "Resource Booking System | Sistem Tempahan Ruang & Peralatan",
    description:
      "Sistem Tempahan Ruang & Peralatan untuk pengurusan tempahan bilik perbincangan, makmal komputer serta peralatan studio dan sukan kampus.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resource Booking System | Sistem Tempahan Ruang & Peralatan",
    description:
      "Sistem Tempahan Ruang & Peralatan untuk pengurusan tempahan bilik perbincangan, makmal komputer serta peralatan studio dan sukan kampus.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ms"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <body suppressHydrationWarning className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
