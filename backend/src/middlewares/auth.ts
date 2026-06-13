import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "./errorHandler";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new AppError("Unauthorized: No token provided", 401);
    }
    console.log("token",token);
    const decoded = verifyToken(token);
    if (!decoded) {
      throw new AppError("Unauthorized: Invalid token", 401);
    }
    console.log("decoded",decoded);
    (req as any).user = decoded; // Attach user to request
    next();
  } catch (error) {
    next(new AppError("Unauthorized: Invalid token", 401));
  }
};
