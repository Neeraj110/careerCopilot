import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "../schemas/user.schemas.js";
import { userService } from "../services/user.service.js";

class UserController {
  async register(req: Request, res: Response) {
    try {
      const parsedBody = registerSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: parsedBody.error.flatten(),
        });
      }

      const serviceResult = await userService.register(parsedBody.data);

      if (!serviceResult.ok) {
        return res
          .status(serviceResult.status)
          .json({ error: serviceResult.error });
      }

      res.cookie("refreshToken", serviceResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(serviceResult.status).json({
        message: serviceResult.message,
        accessToken: serviceResult.accessToken,
        user: serviceResult.user
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const parsedBody = loginSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: parsedBody.error.flatten(),
        });
      }

      const serviceResult = await userService.login(parsedBody.data);

      if (!serviceResult.ok) {
        return res
          .status(serviceResult.status)
          .json({ error: serviceResult.error });
      }

      res.cookie("refreshToken", serviceResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(serviceResult.status).json({
        message: serviceResult.message,
        accessToken: serviceResult.accessToken,
        user: serviceResult.user,
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token provided" });
      }

      const serviceResult = await userService.refreshSession(refreshToken);
      if (!serviceResult.ok) {
        res.clearCookie("refreshToken");
        return res.status(serviceResult.status).json({ error: serviceResult.error });
      }

      res.cookie("refreshToken", serviceResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(serviceResult.status).json({
        message: serviceResult.message,
        accessToken: serviceResult.accessToken,
        user: serviceResult.user,
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        await userService.logout(refreshToken);
        res.clearCookie("refreshToken");
      }
      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const userController = new UserController();
