import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

import { requireEnv } from "./env.js";

const ACCESS_TOKEN_SECRET = requireEnv("ACCESS_TOKEN_SECRET");
const REFRESH_TOKEN_SECRET = requireEnv("REFRESH_TOKEN_SECRET");

export function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
}
