import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
];

const config: NextConfig = {
  async headers() {
    return [{ headers: SECURITY_HEADERS, source: "/(.*)" }];
  },
  serverExternalPackages: ["@messanga11/core"],
  transpilePackages: ["@starter/design-system", "@starter/domain", "@starter/ui-web"],
};

export default config;
