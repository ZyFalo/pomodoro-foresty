/* eslint-disable @next/next/no-page-custom-font --
   Inter and the Material Symbols icon font are loaded from the Google Fonts CDN
   by design. next/font does not support the Material Symbols variable-axis icon
   font, so both are kept as <link> tags in the root layout. */
import type { Metadata, Viewport } from "next";
import "./globals.css";

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
  themeColor: "#2E8B57",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
