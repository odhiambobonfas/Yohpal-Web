// NOTE(0f80476cffa0)
export function onlyProd<T>(fn: () => Promise<T>, devData: T): Promise<T> {
    return process.env.NODE_ENV === "production" ? fn() : Promise.resolve(devData)
}
