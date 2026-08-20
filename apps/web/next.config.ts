import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "form-action 'self'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "upgrade-insecure-requests"
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin"
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "X-Frame-Options",
    value: "DENY"
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()"
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains"
  }
];

const privateCacheHeaders = [
  {
    key: "Cache-Control",
    value: "private, no-store, max-age=0, must-revalidate"
  }
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@industrial-learn/database",
    "@industrial-learn/design-system",
    "@industrial-learn/env",
    "@industrial-learn/shared"
  ],
  headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      },
      {
        source:
          "/(dashboard|my-learning|assessments|simulations/history|projects|author|review|admin)",
        headers: privateCacheHeaders
      },
      {
        source:
          "/(dashboard|my-learning|assessments|simulations/history|projects|author|review|admin)/:path*",
        headers: privateCacheHeaders
      }
    ];
  }
};

export default nextConfig;
