import type { Metadata } from "next";
import "./globals.css";
import {LanguageProvider} from "../components/language-provider";

export const metadata: Metadata = {
  title: "Rum Collection — The Collector's Archive",
  description: "An international archive and community for rum collectors.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><LanguageProvider>{children}</LanguageProvider></body>
    </html>
  );
}
