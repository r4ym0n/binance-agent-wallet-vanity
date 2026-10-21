import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDict } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 元信息用静态文案(cookies/headers 不能进 generateMetadata,否则阻止预渲染)。
// lang 属性静态为 zh-CN,客户端语言切换时由 LanguageSwitcher 同步更新。
const t = getDict("zh");

export const metadata: Metadata = {
  title: {
    default: `${t.siteNameFull} · ${t.siteName}`,
    template: `%s · ${t.siteName}`,
  },
  description: t.meta.defaultDesc,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink font-sans text-foreground">
        <Suspense fallback={<header className="sticky top-0 z-40 h-14 border-b border-white/5 bg-ink/85 backdrop-blur" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
