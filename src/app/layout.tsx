import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { OfflineInit } from "./OfflineInit";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IDEAL GESTION",
  description: "Système de Gestion Commerciale pour l'Algérie",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CRM v3",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <OfflineInit />
        {children}
      </body>
    </html>
  );
}
