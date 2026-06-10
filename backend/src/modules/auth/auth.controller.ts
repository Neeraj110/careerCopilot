import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schema";
import { catchAsync } from "../../utils/catchAsync";

const sendAuthResponse = (
  res: Response,
  statusCode: number,
  user: any,
  token: string,
) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
  res.status(statusCode).json({ status: "success", data: { user } });
};

export const register = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const validatedData = registerSchema.parse(req.body);
  const { user, token } = await authService.registerUser(validatedData);
  sendAuthResponse(res, 201, user, token);
});

export const login = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const validatedData = loginSchema.parse(req.body);
  const { user, token } = await authService.loginUser(validatedData);
  sendAuthResponse(res, 200, user, token);
});

export const logout = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.clearCookie("token");
  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully" });
});

export const getUserProfile = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await authService.getUserProfile(req.user!.id);
  res.status(200).json({ status: "success", data: user });
});
