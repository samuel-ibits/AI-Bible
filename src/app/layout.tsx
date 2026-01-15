import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

/**
 * Geist fonts from `geist/font`
 * ❌ NO function call
 * ❌ NO subsets
 * ❌ NO variables config
 * ✅ They are preconfigured
 */
const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: "AiBiblie",
  description: "Real-time conversation analysis with intelligent Bible verse matching and presentation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} ${geistMono.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
