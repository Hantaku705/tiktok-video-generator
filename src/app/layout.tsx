import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TikTok 5^6 Video Generator",
  description: "Generate up to 15,625 unique TikTok videos from 30 clips",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
