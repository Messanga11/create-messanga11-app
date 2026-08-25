import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@starter/design-system/web.css";
import "./styles.css";

export const metadata: Metadata = {
  description: "Next.js and Expo starter powered by Messanga11 Core.",
  title: "__PROJECT_NAME__",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
