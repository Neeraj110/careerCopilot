import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../../config";
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
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
  res.status(statusCode).json({ status: "success", data: { user } });
};

export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = registerSchema.parse(req.body);
    const { user, token } = await authService.registerUser(validatedData);
    sendAuthResponse(res, 201, user, token);
  },
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = loginSchema.parse(req.body);
    const { user, token } = await authService.loginUser(validatedData);
    sendAuthResponse(res, 200, user, token);
  },
);

export const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("token");
    res
      .status(200)
      .json({ status: "success", message: "Logged out successfully" });
  },
);

export const getUserProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await authService.getUserProfile((req.user as any).id);
    res.status(200).json({ status: "success", data: user });
  },
);

export const googleCallback = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=Google auth failed`,
      );
      return;
    }

    const user = req.user as any;
    const token = jwt.sign({ id: user.id }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard`,
    );
  },
);
