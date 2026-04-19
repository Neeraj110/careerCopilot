import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../libs/prisma.js";
import { generateTokens } from "../libs/genrateTokens.js";
import type {
  LoginInput,
  RegisterInput,
  UserServiceResult,
} from "../types/user.types.js";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

class UserService {
  async register(input: RegisterInput): Promise<UserServiceResult> {
    const { email, password, name } = input;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return {
        ok: false as const,
        status: 400,
        error: "Email already in use",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const { accessToken, refreshToken } = generateTokens(user.id);

    // Save refresh token to DB
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshSession.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return {
      ok: true as const,
      status: 201,
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async login(input: LoginInput): Promise<UserServiceResult> {
    const { email, password } = input;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        ok: false as const,
        status: 401,
        error: "Invalid email or password",
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        ok: false as const,
        status: 401,
        error: "Invalid email or password",
      };
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    // Save refresh token to DB
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshSession.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return {
      ok: true as const,
      status: 200,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async refreshSession(refreshToken: string): Promise<UserServiceResult> {
    try {
      if (!process.env.REFRESH_TOKEN_SECRET) throw new Error("REFRESH_TOKEN_SECRET is not set");
      
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const tokenHash = hashToken(refreshToken);

      const session = await prisma.refreshSession.findUnique({
        where: { tokenHash },
        include: { user: true }
      });

      if (!session || session.revokedAt || session.expiresAt < new Date()) {
        return { ok: false as const, status: 401, error: "Invalid refresh token" };
      }

      // Generate new tokens
      const tokens = generateTokens(session.userId);

      // Rotate session: Delete old, create new
      await prisma.$transaction([
        prisma.refreshSession.delete({ where: { id: session.id } }),
        prisma.refreshSession.create({
          data: {
            userId: session.userId,
            tokenHash: hashToken(tokens.refreshToken),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days padding
          }
        })
      ]);

      return {
        ok: true as const,
        status: 200,
        message: "Session refreshed",
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
        },
      };
    } catch (e) {
      return {
        ok: false as const,
        status: 401,
        error: "Invalid or expired refresh token",
      };
    }
  }

  async logout(refreshToken: string): Promise<{ ok: boolean }> {
    try {
      const tokenHash = hashToken(refreshToken);
      await prisma.refreshSession.deleteMany({
        where: { tokenHash }
      });
      return { ok: true };
    } catch (e) {
      return { ok: false };
    }
  }
}

export const userService = new UserService();
