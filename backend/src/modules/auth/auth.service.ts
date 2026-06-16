import { prisma } from "../../infrastructure/prisma";
import { hashPassword, comparePassword } from "../../utils/bcrypt";
import { generateToken } from "../../utils/jwt";
import { AppError } from "../../middlewares/errorHandler";
import { z } from "zod";
import { registerSchema, loginSchema } from "./auth.schema";

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });

  const token = generateToken(user.id);

  return { user: { id: user.id, email: user.email, name: user.name }, token };
};

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user || !user.password) {
    throw new AppError("Invalid credentials", 401);
  }

  const isValid = await comparePassword(data.password, user.password);

  if (!isValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateToken(user.id);

  return { user: { id: user.id, email: user.email }, token };
};

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
