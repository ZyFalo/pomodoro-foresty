/* eslint-disable @next/next/no-page-custom-font --
   La fuente de iconos Material Symbols (variable-axis) se carga desde el CDN de
   Google Fonts; next/font no la soporta. Las fuentes de texto (Fraunces y Hanken
   Grotesk) sí usan next/font. */
import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pomodoro Forest",
  description: "Técnica Pomodoro gamificada — Completa sesiones de enfoque y colecciona árboles únicos",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pomodoro Forest",
  },
};

export const viewport: Viewport = {
  themeColor: "#0C1610",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${fraunces.variable} ${hanken.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-forest-950">
        {children}
      </body>
    </html>
  );
}
