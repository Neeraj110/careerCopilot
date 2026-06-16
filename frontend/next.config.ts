import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is the default bundler in Next.js 16+.
  // The empty config here silences the "no turbopack config" warning.
  // @react-pdf/renderer SSR is handled via dynamic(() => ..., { ssr: false })
  // in the export page — no webpack externals needed.
  turbopack: {},
};

export default nextConfig;
