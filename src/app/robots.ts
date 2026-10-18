import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://menteunida.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/app/", "/consultorio/", "/verificacion"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
