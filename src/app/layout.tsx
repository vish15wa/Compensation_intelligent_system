import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/layouts/Providers";
import Navbar from "@/components/layouts/Navbar";

export const metadata: Metadata = {
  title: "PayLens - Compensation Intelligence Platform",
  description: "Search, analyze, and compare salaries across top tech companies, levels, and locations.",
  keywords: ["salary", "compensation", "levels.fyi", "software engineer salary", "tech compensation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💸</text></svg>"/>
      </head>
      <body className="antialiased selection:bg-bronze selection:text-white bg-background text-foreground">
        <Providers>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
            {children}
          </main>
          <footer className="border-t border-olive py-6 text-center text-xs text-muted-foreground bg-white/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4">
              &copy; {new Date().getFullYear()} PayLens. Built for transparent, data-driven career choices.
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
