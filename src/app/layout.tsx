import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "ORA — Prayer Warrior",
  description: "A reverent Catholic prayer companion. Daily Mass readings, Liturgy of the Hours, the Holy Rosary, and more.",
  applicationName: "ORA",
  appleWebApp: { capable: true, title: "ORA", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#1B1916",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-body)" }}>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
