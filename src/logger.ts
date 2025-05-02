import pino, { LoggerOptions } from "pino";
import os from "os";
import { getenv } from "./config";

export const getLoggerInstance = (service: string, options?: LoggerOptions) => {
    return pino({
        ...options,
        base: {
            env: getenv("NODE_ENV"),
            pid: process.pid,
            hostname: os.hostname()
        },
        transport: {
            targets: [
                {
                    target: "pino-loki",
                    options: {
                        batching: true,
                        interval: 5,
                        labels: {
                            service
                        },
                        host: getenv("LOKI_HOST"),
                        basicAuth: {
                            username: getenv("LOKI_USERNAME"),
                            password: getenv("LOKI_PASSWORD")
                        }
                    }
                },
                {
                    target: "pino/file",
                    options: { destination: 1 }
                }
            ]
        }
    });
};
