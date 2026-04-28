import type { Request, Response, CookieOptions } from "express";
import { loginSchema, registerSchema } from "../schemas/user.schemas.js";
import { userService } from "../services/user.service.js";

const isProduction = process.env.NODE_ENV === "production";

function getRefreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

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

      res.cookie("refreshToken", serviceResult.refreshToken, getRefreshCookieOptions());

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

      res.cookie("refreshToken", serviceResult.refreshToken, getRefreshCookieOptions());

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
        res.clearCookie("refreshToken", getRefreshCookieOptions());
        return res.status(serviceResult.status).json({ error: serviceResult.error });
      }

      res.cookie("refreshToken", serviceResult.refreshToken, getRefreshCookieOptions());

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
        res.clearCookie("refreshToken", getRefreshCookieOptions());
      }
      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async oauthCallback(req: Request, res: Response) {
    try {
      const user = req.user as any;
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=OAuthFailed`);
      }

      const { generateTokens } = await import("../libs/genrateTokens.js");

      // Instead, we can just use userService's internal logic, or export hashToken.
      // Better: add a generateSession method to userService.
      const tokens = generateTokens(user.id);
      
      const crypto = await import("crypto");
      const { prisma } = await import("../libs/prisma.js");
      const tokenHash = crypto.createHash("sha256").update(tokens.refreshToken).digest("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.refreshSession.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      res.cookie("refreshToken", tokens.refreshToken, getRefreshCookieOptions());

      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`);
    } catch (error) {
      console.error(error);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=OAuthFailed`);
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      // User should be attached by auth middleware
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { changePasswordSchema } = await import("../schemas/user.schemas.js");
      const parsedBody = changePasswordSchema.safeParse(req.body);
      
      if (!parsedBody.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: parsedBody.error.flatten(),
        });
      }

      const { currentPassword, newPassword } = parsedBody.data;
      const serviceResult = await userService.changePassword(userId, currentPassword, newPassword);

      if (!serviceResult.ok) {
        return res.status(serviceResult.status).json({ error: serviceResult.error });
      }

      return res.status(200).json({ message: serviceResult.message });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const userController = new UserController();
