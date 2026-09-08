import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PRODUCT_NAME } from "@industrial-learn/shared";

import { SiteNavigation } from "@/features/auth/site-navigation";
import { themeInitialiser } from "@/features/theme/theme";

import "@industrial-learn/design-system/styles.css";
import "./globals.css";
import "@/features/app-shell/shell.css";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/InterVariable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitialiser }} />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <div className="app-shell">
          <SiteNavigation />
          <main id="main-content" className="main-content" tabIndex={-1}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
