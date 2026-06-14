import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UNSA Career Connect | Bolsa de Trabajo",
  description:
    "Plataforma oficial de oportunidades laborales y prácticas de la Universidad Nacional de San Agustín de Arequipa. Conectamos talento universitario con empresas.",
  keywords: ["UNSA", "bolsa de trabajo", "prácticas", "Arequipa", "empleo", "egresados"],
  openGraph: {
    title: "UNSA Career Connect",
    description: "Bolsa de Trabajo oficial de la UNSA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
