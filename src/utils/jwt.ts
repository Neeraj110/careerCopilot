import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config";

export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.jwtSecret);
};
