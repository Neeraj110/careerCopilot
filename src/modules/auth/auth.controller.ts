import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schema";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { user, token } = await authService.registerUser(validatedData);
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(201).json({ status: "success", data: { user } });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { user, token } = await authService.loginUser(validatedData);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({ status: "success", data: { user } });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.clearCookie("token");
    res
      .status(200)
      .json({ status: "success", message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await authService.getUserProfile(req.user.id);
    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    next(error);
  }
};
