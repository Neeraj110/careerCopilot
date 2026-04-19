import type { NextFunction, Request, Response } from "express";
import { logger } from "../libs/logger.js";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const logPayload = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
    };

    if (res.statusCode >= 500) {
      logger.error(
        logPayload,
        `${req.method} ${req.originalUrl} ${res.statusCode}`,
      );
      return;
    }

    if (res.statusCode >= 400) {
      logger.warn(
        logPayload,
        `${req.method} ${req.originalUrl} ${res.statusCode}`,
      );
      return;
    }

    logger.info(
      logPayload,
      `${req.method} ${req.originalUrl} ${res.statusCode}`,
    );
  });

  next();
}
