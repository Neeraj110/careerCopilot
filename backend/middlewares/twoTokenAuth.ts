import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { prisma } from "../libs/prisma.js";
import type { AuthenticatedRequest } from "../types/auth.types.js";

dotenv.config();

import { requireEnv } from "../libs/env.js";

const ACCESS_TOKEN_SECRET = requireEnv("ACCESS_TOKEN_SECRET");

export const authenticateTokens = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access token missing" });
  }
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Access token expired" });
  }
};
