import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Yohpal",
        short_name: "Yohpal",
        description: "Yohpal Monetizing Creativity",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#ffffff",
        theme_color: "#D81F26",
        icons: [
            {
                src: "/icons/logo_circular.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icons/logo_circular.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    }
}
