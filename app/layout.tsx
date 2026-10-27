import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ToastProvider } from "@/components/shared/Toast";
import { SessionWelcome } from "@/components/shared/SessionWelcome";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BuildLog - Build. Learn. Document.",
    template: "%s - BuildLog",
  },
  description:
    "Personal engineering notes, architectural experiments, and field learnings from a solo developer. Build. Learn. Document.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "BuildLog - Build. Learn. Document.",
    description:
      "A personal developer journal documenting what I build, what I learn, and the problems I solve.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      // The theme script in <head> may add a `dark` class before React hydrates;
      // suppress the expected className mismatch it would otherwise log.
      suppressHydrationWarning
      className={`${newsreader.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <head>
        <script
          // Apply the saved theme before first paint. Default is light; only
          // switch to dark if the user explicitly chose it previously.
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("buildlog-theme");if(t==="dark"){document.documentElement.classList.add("dark")}}catch(e){}`,
          }}
        />
        {/* Icon glyphs ARE ligature text ("search" renders as the magnifier),
            so Google's default display=swap briefly paints the raw names on
            every refresh. display=block keeps icons invisible for the few ms
            the font needs instead; preconnect starts the handshake early. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      {/* min-h-dvh, not min-h-screen: mobile browsers count the area behind
          the URL bar in 100vh, which pushed centered content below the fold. */}
      <body className="bg-background text-on-surface font-body-md text-body-md min-h-dvh flex flex-col antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
        <ToastProvider>
          {children}
          <SessionWelcome />
        </ToastProvider>
      </body>
    </html>
  );
}
