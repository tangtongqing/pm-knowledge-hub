"use client";

import { ThemeProvider } from "./ThemeProvider";
import Navigation from "./Navigation";
import styles from "./AppLayout.module.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className={styles.shell}>
        <Navigation />
        <main className={styles.main}>{children}</main>
      </div>
    </ThemeProvider>
  );
}
