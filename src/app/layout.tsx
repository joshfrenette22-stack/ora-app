import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { ThemeProvider } from "@/components/ThemeProvider";
import { VoiceProvider } from "@/components/VoiceProvider";
import { NowPlayingProvider } from "@/components/NowPlayingProvider";
import { SplashScreen } from "@/components/SplashScreen";

export const metadata: Metadata = {
  title: "Prayer Warrior",
  description: "A reverent Catholic prayer companion. Daily Mass readings, Liturgy of the Hours, the Holy Rosary, and more.",
  applicationName: "Prayer Warrior",
  appleWebApp: { capable: true, title: "Prayer Warrior", statusBarStyle: "black-translucent" },
  openGraph: {
    title: "Prayer Warrior",
    description: "A reverent Catholic prayer companion. Daily Mass readings, Liturgy of the Hours, the Holy Rosary, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prayer Warrior",
    description: "A reverent Catholic prayer companion.",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B1916",
  // Required for env(safe-area-inset-*) to resolve on iOS standalone (home-screen
  // app), so the bottom nav clears the home indicator and the header clears the notch.
  viewportFit: "cover",
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
          <VoiceProvider>
            <NowPlayingProvider>
              <AppShell>{children}</AppShell>
            </NowPlayingProvider>
          </VoiceProvider>
          <SplashScreen />
        </ThemeProvider>
      </body>
    </html>
  );
}
