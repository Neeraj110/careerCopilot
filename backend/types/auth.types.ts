import type { Request } from "express";
import type { User } from "../generated/prisma/client.js";

export interface AuthenticatedRequest extends Request {
  user?: any;
}
