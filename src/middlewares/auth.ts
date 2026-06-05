import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "./errorHandler";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new AppError("Unauthorized: No token provided", 401);
    }
    const decoded = verifyToken(token);

    (req as any).user = decoded; // Attach user to request
    next();
  } catch (error) {
    next(new AppError("Unauthorized: Invalid token", 401));
  }
};
