import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Evveri - Gayrimenkul Analiz Platformu",
  description: "TCMB resmi verileri ile desteklenen gayrimenkul piyasası analizleri, kira-kredi karşılaştırmaları ve şehir bazlı fiyat trendleri",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
