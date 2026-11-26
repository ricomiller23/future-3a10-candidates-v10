import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FUTURE 3a10candidates | SEC Section 3(a)(10) Debt Restructuring Screener",
  description: "Screen micro-cap public companies under $100M market cap for Section 3(a)(10) debt settlement, court fairness hearings, and real liabilities restructuring suitability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head><link rel="stylesheet" href="/v10-responsive.css" /></head>
      <body className="min-h-full flex flex-col bg-[#080c14] text-slate-100">{children}  <script src="/v10-suite.js" defer></script>
      </body>
    </html>
  );
}
