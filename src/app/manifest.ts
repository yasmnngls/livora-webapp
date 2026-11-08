import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Livora",
    short_name: "Livora",
    description: "Find the right dormmate and the right room.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f7f5",
    theme_color: "#0f766e",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
