import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import documentRoutes from "./modules/document/document.routes";
import chatRoutes from "./modules/chat/chat.routes";
import resumeRoutes from "./modules/resume/resume.route";
import roadmapRoutes from "./modules/roadmap/roadmap.routes";
import resumeV2Routes from "./modules/resume-v2/resume-v2.route";
import * as resumeV2Ctrl from "./modules/resume-v2/resume-v2.controller";
import { requireAuth } from "./middlewares/auth";
import cookieParser from "cookie-parser";
import passport from "passport";
import { configurePassport } from "./config/passport";
const app = express();

// Security and Optimization middlewares
app.use(helmet());
app.use(compression());

// CORS setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize Passport
configurePassport();
app.use(passport.initialize());

// Logging
app.use(morgan("dev"));

// Swagger API Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/resume", resumeRoutes);
app.use("/api/v1/roadmap", roadmapRoutes);

// ── Resume V2 (versioning pipeline) ────────────────────────────────────
app.use("/api/v1/resumes", resumeV2Routes);
app.get("/api/v1/dashboard", requireAuth, resumeV2Ctrl.dashboard);
app.get("/api/v1/insights", requireAuth, resumeV2Ctrl.insights);
app.get("/api/v1/versions", requireAuth, resumeV2Ctrl.allVersions);
app.get("/api/v1/history", requireAuth, resumeV2Ctrl.history);
app.patch("/api/v1/auth/profile", requireAuth, resumeV2Ctrl.updateProfile);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

export default app;

