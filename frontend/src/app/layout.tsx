import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boss Finance & Consulting",
  description: "Loan Management System - Boss Finance & Consulting Admin",
  applicationName: "Boss Finance",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/BossLogo.png", sizes: "192x192", type: "image/png" },
      { url: "/BossLogo.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/BossLogo.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/BossLogo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0c1f45" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/BossLogo.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/BossLogo.png" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
