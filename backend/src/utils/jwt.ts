import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config";

interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
};
