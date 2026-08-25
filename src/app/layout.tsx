import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Bhargav M | Unity VR Developer & AI Engineer",
  description:
    "Bhargav M — Unity VR/AR Developer & AI Engineer building immersive experiences and the intelligence behind them.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%2307101D'/%3E%3Ccircle cx='50' cy='50' r='30' fill='none' stroke='%238B5CF6' stroke-width='6'/%3E%3C/svg%3E",
  },
  openGraph: {
    title: "Bhargav M | Unity VR Developer & AI Engineer",
    description:
      "Interactive 3D portfolio — Unity VR/AR development, applied AI, and the projects behind both.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>
        <noscript>
          <div style={{ padding: "4rem", color: "#F8FAFC", background: "#030712", fontFamily: "sans-serif" }}>
            This portfolio needs JavaScript enabled for its interactive 3D experience. View the source at{" "}
            <a href="https://github.com/bhargavm-iiits/E-Portfolio" style={{ color: "#8B5CF6" }}>
              github.com/bhargavm-iiits/E-Portfolio
            </a>
            .
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
