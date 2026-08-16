import type { MetadataRoute } from "next";

/**
 * "Add to Home Screen" support (design doc §2/§7) — the whole point of
 * the PWA decision over a native app: install-free from an ad click,
 * with an optional home-screen shortcut for a parent who comes back.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sensory Yard",
    short_name: "Sensory Yard",
    description:
      "A free, personalized backyard sensory play plan for your kid.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf5ec",
    theme_color: "#faf5ec",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
