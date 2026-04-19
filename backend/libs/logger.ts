import dotenv from "dotenv";
import pino from "pino";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const loggerOptions = isProduction
  ? {
      level: process.env.LOG_LEVEL || "info",
    }
  : {
      level: process.env.LOG_LEVEL || "debug",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
    };

export const logger = pino(loggerOptions);
