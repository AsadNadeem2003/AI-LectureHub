import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import GlobalNavbar from "@/components/layout/GlobalNavbar";
import LenisProvider from "@/components/layout/LenisProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AI LectureHub — Smart Educational Platform",
  description:
    "AI-powered educational platform where teachers upload materials and AI generates narrated lectures with synced visuals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <LenisProvider>
          <GlobalNavbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </LenisProvider>
      </body>
    </html>
  );
}
