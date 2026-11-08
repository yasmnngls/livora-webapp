import type { NextConfig } from "next";

// cacheComponents is off: every screen depends on the session cookie, so all
// routes render per request. Revisit when a real backend lands.
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
