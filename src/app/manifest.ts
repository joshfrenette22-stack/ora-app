import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prayer Warrior",
    short_name: "Prayer Warrior",
    description:
      "A reverent Catholic prayer companion. Daily Mass readings, Liturgy of the Hours, the Holy Rosary, and more.",
    id: "/",
    start_url: "/",
    scope: "/",
    lang: "en",
    dir: "ltr",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1B1916",
    theme_color: "#1B1916",
    categories: ["lifestyle", "books", "education"],
    // Android/Chrome requires both a 192px and a 512px icon to offer "Install
    // app". The maskable variants keep the crucifix inside the ~80% safe zone
    // so launcher shapes (circle/squircle) never clip it. (iOS uses /apple-icon.)
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon/maskable-192", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon/maskable-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
