import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PRODUCT_NAME } from "@industrial-learn/shared";

import { SiteNavigation } from "@/features/auth/site-navigation";

import "@industrial-learn/design-system/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: PRODUCT_NAME,
  description:
    "A professional engineering education platform for Core Engineering and Future Engineering."
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <div className="app-shell">
          <header className="site-header" aria-label="Application header">
            <div>
              <p className="eyebrow">Industrial Learn</p>
              <p className="site-subtitle">Engineering education platform foundation</p>
            </div>
            <SiteNavigation />
          </header>
          <main id="main-content" className="main-content" tabIndex={-1}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
