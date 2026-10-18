import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async redirects() {
    return [
      {
        source: "/dashboard/paciente",
        destination: "/app/paciente",
        permanent: false,
      },
      {
        source: "/dashboard/paciente/:path*",
        destination: "/app/paciente/:path*",
        permanent: false,
      },
      {
        source: "/dashboard/psicologo",
        destination: "/app/psicologo",
        permanent: false,
      },
      {
        source: "/dashboard/psicologo/:path*",
        destination: "/app/psicologo/:path*",
        permanent: false,
      },
      {
        source: "/dashboard/book-session",
        destination: "/app/book-session",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
