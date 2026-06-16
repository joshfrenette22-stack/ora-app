import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ORA — Prayer Warrior",
    short_name: "ORA",
    description:
      "A reverent Catholic prayer companion. Daily Mass readings, Liturgy of the Hours, the Holy Rosary, and more.",
    start_url: "/",
    display: "standalone",
    background_color: "#1B1916",
    theme_color: "#1B1916",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
