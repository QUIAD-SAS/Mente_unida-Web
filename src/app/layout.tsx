import { QueryProvider } from "@/components/providers/query-provider";
import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://menteunida.com",
  ),
  title: {
    default: "Mente Unida — Salud mental y comunidad profesional",
    template: "%s | Mente Unida",
  },
  description:
    "Un espacio seguro donde las personas encuentran apoyo profesional y los psicólogos desarrollan su práctica, comparten experiencias y crecen junto a una comunidad comprometida con el bienestar emocional.",
  keywords: [
    "salud mental",
    "apoyo psicológico",
    "ecosistema salud mental",
    "comunidad profesional",
    "Latinoamérica",
  ],
  openGraph: {
    type: "website",
    locale: "es_LA",
    siteName: "Mente Unida",
    title: "Mente Unida — Bienestar y crecimiento profesional",
    description:
      "Ecosistema de salud mental: apoyo para personas, herramientas y comunidad para profesionales.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4F8FBF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
