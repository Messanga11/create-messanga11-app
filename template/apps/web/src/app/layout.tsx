import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@starter/ui-web/styles.css";
import { getSiteUrl } from "./site-url";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: "__PROJECT_NAME__",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
