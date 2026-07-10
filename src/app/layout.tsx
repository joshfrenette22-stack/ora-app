import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { ThemeProvider } from "@/components/ThemeProvider";
import { VoiceProvider } from "@/components/VoiceProvider";
import { NowPlayingProvider } from "@/components/NowPlayingProvider";
import { SplashScreen } from "@/components/SplashScreen";
import { UpdateChecker } from "@/components/UpdateChecker";
import { ServiceWorkerManager } from "@/components/ServiceWorkerManager";

// Self-hosted via next/font — no render-blocking request to fonts.googleapis.com,
// no font flash, and the app keeps its typography offline.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-jakarta",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

// Applies the saved night-mode class before first paint so night users never
// see a flash of the day theme (see the "preventing flash" pattern).
const themeInit = `try{if(localStorage.getItem("ora-night")==="true")document.documentElement.classList.add("ora-night")}catch(e){}`;

export const metadata: Metadata = {
  // Absolute base for OG/twitter images: the deployment URL on Vercel, else
  // localhost (silences the metadataBase build warning in dev).
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL
      ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  ),
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
    <html lang="en" className={`h-full antialiased ${jakarta.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-body)" }}>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <ThemeProvider>
          <VoiceProvider>
            <NowPlayingProvider>
              <AppShell>{children}</AppShell>
            </NowPlayingProvider>
          </VoiceProvider>
          <SplashScreen />
          <UpdateChecker />
          <ServiceWorkerManager />
        </ThemeProvider>
      </body>
    </html>
  );
}
