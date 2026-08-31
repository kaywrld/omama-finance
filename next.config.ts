import type { NextConfig } from "next";

// BUILD_TARGET=static  -> static export for omamafinance.co.zw (no Node needed)
// BUILD_TARGET unset   -> normal server build for the API-only Node cPanel app
const isStaticBuild = process.env.BUILD_TARGET === "static";

const nextConfig: NextConfig = {
  // Static HTML export only for the main site build. The API deployment
  // needs a real server (nodemailer, prisma, PDF generation), so it must
  // NOT use output:'export' - that mode disables API routes entirely.
  ...(isStaticBuild ? { output: "export" as const } : {}),

  // Forces every route to output as folder/index.html (e.g. about/index.html)
  // instead of a flat about.html file. Apache serves folder/index.html
  // automatically via its default DirectoryIndex behavior, which is why the
  // /about, /contact etc. folders on the server need this to actually
  // contain an index.html rather than being empty.
  trailingSlash: true,

  // Don't leak the framework in response headers.
  poweredByHeader: false,

  images: {
    // Static export can't use Next's on-demand image optimization (needs
    // a server) - unoptimized just serves the images as-is, which is fine
    // here since there's no remote/CMS image source configured yet.
    unoptimized: true,
    remotePatterns: [],
  },

  // NOTE: the headers() config that used to live here doesn't work with
  // output:'export' (no server to apply them at request time). The
  // equivalent Cache-Control/X-Content-Type-Options/Referrer-Policy rules
  // are now set via .htaccess instead - see the deployment guide.
};

export default nextConfig;