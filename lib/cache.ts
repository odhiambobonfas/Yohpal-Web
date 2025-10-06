import { unstable_cache } from "next/cache"

// TODO(db9c9e8f0254)
export async function withCache<T>(fn: () => Promise<T>, key: string, tags?: string[]) {
    const start = Date.now()
    const result = await unstable_cache(fn, [key], {
        revalidate: 300, //secs
        tags: tags,
    })()
    console.debug(`[Cache] ${key} - ${Date.now() - start}ms`)
    return result
}
