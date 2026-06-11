import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import documentRoutes from "./modules/document/document.routes";
import chatRoutes from "./modules/chat/chat.routes";
import resumeRoutes from "./modules/resume/resume.route";
import roadmapRoutes from "./modules/roadmap/roadmap.routes";
import cookieParser from "cookie-parser";

const app = express();

// Security middlewares
app.use(helmet());

// CORS setup
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     credentials: true,
//   }),
// );
// app.ts
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Accept",
      "X-Accel-Buffering",
    ],
    exposedHeaders: ["Content-Type"],
  }),
);

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

export default app;
