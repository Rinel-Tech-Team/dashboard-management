import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rinel HR Management",
  description: "Sistem Manajemen SDM & ERP — Rinel Tech Nusantara",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
