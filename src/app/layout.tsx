import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LuxeLedger",
  description: "Internal MVP for customer check-in and check-out operations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IE">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">{children}</body>
    </html>
  );
}
