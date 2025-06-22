export enum LogLevel {
    TRACE = 0,
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
    SILENT = 5
}

const DEFAULT_LOG_LEVEL = process.env.NODE_ENV === 'production'
    ? LogLevel.INFO
    : LogLevel.DEBUG;

const getLogLevel = (): LogLevel => {
    const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL;
    if (!envLevel) return DEFAULT_LOG_LEVEL;

    switch (envLevel.toUpperCase()) {
        case 'TRACE':
            return LogLevel.TRACE;
        case 'DEBUG':
            return LogLevel.DEBUG;
        case 'INFO':
            return LogLevel.INFO;
        case 'WARN':
            return LogLevel.WARN;
        case 'ERROR':
            return LogLevel.ERROR;
        case 'SILENT':
            return LogLevel.SILENT;
        default:
            return DEFAULT_LOG_LEVEL;
    }
};

let currentLogLevel = getLogLevel();

class Logger {
    private namespace: string;

    constructor(namespace: string) {
        this.namespace = namespace;
    }

    static setLevel(level: LogLevel): void {
        currentLogLevel = level;
    }

    static getLevel(): LogLevel {
        return currentLogLevel;
    }

    trace(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.TRACE)) {
            console.trace(this.format(message), ...args);
        }
    }

    debug(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(this.format(message), ...args);
        }
    }

    info(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.INFO)) {
            console.info(this.format(message), ...args);
        }
    }

    warn(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(this.format(message), ...args);
        }
    }

    error(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(this.format(message), ...args);
        }
    }

    private format(message: string): string {
        return `[${this.namespace}] ${message}`;
    }

    private shouldLog(level: LogLevel): boolean {
        return level >= currentLogLevel;
    }
}

export const createLogger = (namespace: string): Logger => {
    return new Logger(namespace);
};

export const logger = createLogger('App');

export default logger;