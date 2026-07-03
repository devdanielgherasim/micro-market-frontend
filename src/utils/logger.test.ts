import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

// The `Logger` class itself is not exported from `./logger` -- only
// `LogLevel`, `createLogger`, and the default `logger` instance are public.
// The active log level is module-level state resolved once at import time
// from `NEXT_PUBLIC_LOG_LEVEL`, so each scenario below sets the env var and
// re-imports the module fresh via `vi.resetModules()`.
describe('logger', () => {
    const originalEnv = {...process.env};

    beforeEach(() => {
        vi.restoreAllMocks();
        vi.resetModules();
        process.env = {...originalEnv};
    });

    afterEach(() => {
        process.env = {...originalEnv};
    });

    async function loadWithLevel(level: string | undefined) {
        if (level === undefined) {
            delete process.env.NEXT_PUBLIC_LOG_LEVEL;
        } else {
            process.env.NEXT_PUBLIC_LOG_LEVEL = level;
        }
        return import('./logger');
    }

    it('routes each method to the matching console method when level is TRACE', async () => {
        const {createLogger} = await loadWithLevel('TRACE');

        const traceSpy = vi.spyOn(console, 'trace').mockImplementation(() => {});
        const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
        const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const log = createLogger('MyNamespace');
        log.trace('trace message');
        log.debug('debug message');
        log.info('info message');
        log.warn('warn message');
        log.error('error message');

        expect(traceSpy).toHaveBeenCalledWith('[MyNamespace] trace message');
        expect(debugSpy).toHaveBeenCalledWith('[MyNamespace] debug message');
        expect(infoSpy).toHaveBeenCalledWith('[MyNamespace] info message');
        expect(warnSpy).toHaveBeenCalledWith('[MyNamespace] warn message');
        expect(errorSpy).toHaveBeenCalledWith('[MyNamespace] error message');
    });

    it('suppresses messages below the configured WARN level', async () => {
        const {createLogger} = await loadWithLevel('WARN');

        const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
        const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const log = createLogger('Quiet');
        log.debug('should be suppressed');
        log.info('should be suppressed too');
        log.warn('should be logged');
        log.error('should also be logged');

        expect(debugSpy).not.toHaveBeenCalled();
        expect(infoSpy).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('SILENT level suppresses every log method, including error', async () => {
        const {createLogger} = await loadWithLevel('SILENT');

        const traceSpy = vi.spyOn(console, 'trace').mockImplementation(() => {});
        const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
        const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const log = createLogger('Silent');
        log.trace('a');
        log.debug('b');
        log.info('c');
        log.warn('d');
        log.error('e');

        expect(traceSpy).not.toHaveBeenCalled();
        expect(debugSpy).not.toHaveBeenCalled();
        expect(infoSpy).not.toHaveBeenCalled();
        expect(warnSpy).not.toHaveBeenCalled();
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it('is case-insensitive when parsing NEXT_PUBLIC_LOG_LEVEL', async () => {
        const {createLogger} = await loadWithLevel('error');

        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const log = createLogger('CaseInsensitive');
        log.warn('suppressed');
        log.error('logged');

        expect(warnSpy).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('falls back to the non-production default (DEBUG) for an unrecognized value', async () => {
        vi.stubEnv('NODE_ENV', 'test');
        const {createLogger} = await loadWithLevel('NOT_A_REAL_LEVEL');

        const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
        const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

        const log = createLogger('Fallback');
        log.debug('should still log at DEBUG default');
        log.info('should log too');

        expect(debugSpy).toHaveBeenCalledTimes(1);
        expect(infoSpy).toHaveBeenCalledTimes(1);
        vi.unstubAllEnvs();
    });

    it('prefixes every message with the logger namespace', async () => {
        const {createLogger} = await loadWithLevel('INFO');
        const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

        createLogger('Payments').info('charge succeeded');

        expect(infoSpy).toHaveBeenCalledWith('[Payments] charge succeeded');
    });

    it('exports a ready-to-use default logger namespaced "App"', async () => {
        const {default: defaultLogger} = await loadWithLevel('INFO');
        const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

        defaultLogger.info('hello');

        expect(infoSpy).toHaveBeenCalledWith('[App] hello');
    });

    it('exposes the LogLevel enum with the expected ordering', async () => {
        const {LogLevel} = await loadWithLevel(undefined);

        expect(LogLevel.TRACE).toBeLessThan(LogLevel.DEBUG);
        expect(LogLevel.DEBUG).toBeLessThan(LogLevel.INFO);
        expect(LogLevel.INFO).toBeLessThan(LogLevel.WARN);
        expect(LogLevel.WARN).toBeLessThan(LogLevel.ERROR);
        expect(LogLevel.ERROR).toBeLessThan(LogLevel.SILENT);
    });
});
