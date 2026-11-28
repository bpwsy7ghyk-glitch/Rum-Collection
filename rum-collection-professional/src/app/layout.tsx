import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rum Collection — The Collector's Archive",
  description: "An international archive and community for rum collectors.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
