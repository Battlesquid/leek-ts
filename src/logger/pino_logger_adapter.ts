import { ILogger as ISapphireLogger } from "@sapphire/framework";
import pino, { Logger, LoggerExtras } from "pino";

declare enum LogLevel {
    Trace = "trace",
    Debug = "debug",
    Info = "info",
    Warn = "warn",
    Error = "error",
    Fatal = "fatal",
}

export class PinoLoggerAdapter implements ISapphireLogger  {
    private logger: Logger;

    constructor(logger?: Logger) {
        this.logger = logger ?? pino();
    }

    has(): boolean {
        // Pino logs all levels by default, so returning true for all levels.
        return true;
    }

    trace(...values: readonly unknown[]): void {
        this.write(LogLevel.Trace, ...values);
    }

    debug(...values: readonly unknown[]): void {
        this.write(LogLevel.Debug, ...values);
    }

    info(...values: readonly unknown[]): void {
        this.write(LogLevel.Info, ...values);
    }

    warn(...values: readonly unknown[]): void {
        this.write(LogLevel.Warn, ...values);
    }

    error(...values: readonly unknown[]): void {
        this.write(LogLevel.Error, ...values);
    }

    fatal(...values: readonly unknown[]): void {
        this.write(LogLevel.Fatal, ...values);
    }

    write(level: LogLevel, ...values: readonly unknown[]): void {
        this.logger[level](values);
    }

    child(...args: Parameters<LoggerExtras["child"]>) {
        return this.logger.child(...args);
    }
}