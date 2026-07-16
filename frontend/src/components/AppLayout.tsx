"use client";

import { ThemeProvider } from "./ThemeProvider";
import Navigation from "./Navigation";
import styles from "./AppLayout.module.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className={styles.shell}>
        <a className={styles.skipLink} href="#main-content">跳到主要内容</a>
        <Navigation />
        <main id="main-content" className={styles.main}>{children}</main>
      </div>
    </ThemeProvider>
  );
}
