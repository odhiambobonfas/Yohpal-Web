import { DEBUG_BUILD } from "@/constants"

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR"
type LogHandler = (level: LogLevel, message: string, data?: unknown) => void

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
}

interface LoggerConfig {
    minLevel?: LogLevel
    onError?: LogHandler
    onInfo?: LogHandler
    onWarn?: LogHandler
}

/*
 * Allows us to hook into external logging services when needed,
 *
 * example:
 *
 * ```ts
 * export const logger = new Logger({
 *    onError: (level, message, data) => {
 *        Sentry.captureMessage(message, "error")
 *    },
 *    onInfo: (message, data) => {
 *        Sentry.captureMessage(message, "info"")
 *    }
 * })
 * ```
 */
class Logger {
    private minLevel: number
    private onInfo?: LogHandler
    private onWarn?: LogHandler
    private onError?: LogHandler

    constructor(config: LoggerConfig = {}) {
        this.minLevel = LOG_LEVELS[config.minLevel || DEBUG_BUILD ? "DEBUG" : "INFO"]
        this.onInfo = config.onInfo
        this.onWarn = config.onWarn
        this.onError = config.onError
    }

    debug(message: string, data?: unknown) {
        if (LOG_LEVELS.DEBUG >= this.minLevel) {
            if (data) {
                console.log(`[DEBUG]`, message, data)
            } else {
                console.log(`[DEBUG]`, message)
            }
        }
    }
    info(message: string, data?: unknown) {
        if (LOG_LEVELS.INFO >= this.minLevel) {
            if (data) {
                console.log(`[INFO]`, message, data)
            } else {
                console.log(`[INFO]`, message)
            }
            this.onInfo?.("INFO", message, data)
        }
    }

    warn(message: string, data?: unknown) {
        if (LOG_LEVELS.WARN >= this.minLevel) {
            if (data) {
                console.log(`[WARN]`, message, data)
            } else {
                console.log(`[WARN]`, message)
            }
            this.onWarn?.("WARN", message, data)
        }
    }
    error(message: string, data?: unknown) {
        if (LOG_LEVELS.ERROR >= this.minLevel) {
            if (data) {
                console.log(`[ERROR]`, message, data)
            } else {
                console.log(`[ERROR]`, message)
            }

            this.onError?.("ERROR", message, data)
        }
    }
}

export const logger = new Logger()
