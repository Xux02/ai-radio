import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 电台 — 你的私人音乐 DJ",
  description: "用 AI 蒸馏你的歌单，打造专属音乐电台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-100 font-sans antialiased">{children}</body>
    </html>
  );
}
