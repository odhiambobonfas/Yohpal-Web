import { DEBUG_BUILD } from "@/constants"

// NOTE(0f80476cffa0)
export function onlyProd<T>(fn: () => Promise<T>, devData: T): Promise<T> {
    return !DEBUG_BUILD ? fn() : Promise.resolve(devData)
}
