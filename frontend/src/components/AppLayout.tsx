"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "./ThemeProvider";
import Navigation from "./Navigation";
import styles from "./AppLayout.module.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <ThemeProvider>
      <div className={styles.shell}>
        <a
          className={`${styles.skipLink} ${isLandingPage ? styles.landingSkipLink : ""}`}
          href="#main-content"
        >
          跳到主要内容
        </a>
        {!isLandingPage && <Navigation />}
        <main
          key={pathname}
          id="main-content"
          className={`${styles.main} ${isLandingPage ? styles.landingMain : styles.applicationMain}`}
        >
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
