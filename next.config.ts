import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export - no Node.js server needed at all, so this can run
  // on cPanel hosting with no Node/SSH support, just plain file hosting.
  output: "export",

  // Don't leak the framework in response headers.
  poweredByHeader: false,

  images: {
    // Static export can't use Next's on-demand image optimization (needs
    // a server) - unoptimized just serves the images as-is, which is fine
    // here since there's no remote/CMS image source configured yet.
    //
    // Because there's no server-side resizing/re-encoding step, the actual
    // files in /public are what ships to the browser byte-for-byte. Keep
    // source images pre-resized to their real display size and saved as
    // .webp (or .avif) before dropping them in /public - that's the only
    // "optimization" available under a static export.
    unoptimized: true,
    remotePatterns: [],
  },

  // NOTE: the headers() config that used to live here doesn't work with
  // output:'export' (no server to apply them at request time). The
  // equivalent Cache-Control/X-Content-Type-Options/Referrer-Policy rules
  // are now set via .htaccess instead - see the deployment guide.
};

export default nextConfig;