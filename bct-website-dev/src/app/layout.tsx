import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard design system",
  description: "Design tokens and components taken from the Office Power dashboard.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Noto+Sans+TC:wght@300;400;500;600&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
