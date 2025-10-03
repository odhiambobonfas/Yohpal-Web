const CACHE_NAME = "app-shell-v1"

// Install: precache assets
self.addEventListener("install", (event) => {
    self.skipWaiting()
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(["/", "/app/**", "/icons/**", "/logo_circular.png", "/org/**"])
        }),
    )
})

self.addEventListener("activate", (event) => {
    event.waitUntil(clients.claim())
})

self.addEventListener("fetch", (event) => {
    const req = event.request

    if (req.mode === "navigate") {
        event.respondWith(
            caches.match(req).then((cached) => {
                if (cached) return cached
                return fetch(req)
                    .then((resp) => {
                        return caches.open(CACHE_NAME).then((cache) => {
                            cache.put(req, resp.clone())
                            return resp
                        })
                    })
                    .catch(() => caches.match("/"))
            }),
        )
    } else {
        event.respondWith(caches.match(req).then((cached) => cached || fetch(req)))
    }
})
