import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sehat Saheli",
    short_name: "SehatSaheli",
    description: "Maternal health assistant for mothers, ASHA workers, and doctors",
    start_url: "/",
    display: "standalone",
    background_color: "#fff8f8",
    theme_color: "#f56c8a",
    icons: [
      {
        src: "/heart_icon_down.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/heart_icon_down.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  }
}
