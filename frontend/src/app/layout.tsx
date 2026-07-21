import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "PM Knowledge Hub｜产品经理的本地知识工作台",
  description:
    "连接 Markdown 与 Obsidian 笔记，用语义检索、带引用 AI 问答、知识图谱与 STAR 模拟面试，把产品知识用于决策与表达。",
  keywords: [
    "产品经理",
    "知识库",
    "Obsidian",
    "AI 问答",
    "语义检索",
    "模拟面试",
  ],
  openGraph: {
    title: "PM Knowledge Hub｜产品经理的本地知识工作台",
    description: "让你的产品知识，随时可以被调用。",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* Inline script to set theme before paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('pmhub-theme');
                  if (t === 'light' || t === 'dark') {
                    document.documentElement.setAttribute('data-theme', t);
                  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch(e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
