import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private or personal pages have nothing for search engines.
      disallow: [
        "/admin",
        "/dashboard",
        "/account",
        "/horses/new",
        "/sign-in",
        "/sign-up",
        "/forgot-password",
        "/reset-password",
        "/auth/",
      ],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
