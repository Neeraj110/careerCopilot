import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import userRoutes from "./routes/user.route.js";
import resumeRoutes from "./routes/resume.route.js";
import jobsRoutes from "./routes/jobs.route.js";
import { logger } from "./libs/logger.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { deleteExpiredJobs, storeScrapedJobs } from "./services/jobStore.js";
import { scrapeJobListings } from "./services/scraper.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT ?? 5000;
const FRONTEND_URL = process.env.FRONTEND_URL;
const DEFAULT_JOB_SEARCH_QUERY =
  process.env.DEFAULT_JOB_SEARCH_QUERY ?? "software engineer remote";
app.use(helmet());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(requestLogger);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

app.use("/api/users", userRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/jobs", jobsRoutes);

app.get("/", (req, res) => {
  logger.info("GET request received for root endpoint");
  res.send("Welcome to the JobFinder API");
});

app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

async function runScheduledJobs() {
  try {
    await deleteExpiredJobs();
    const scrapedJobs = await scrapeJobListings(DEFAULT_JOB_SEARCH_QUERY);
    await storeScrapedJobs(scrapedJobs);
  } catch (error) {
    logger.error({ error }, "Failed to run initial scheduled jobs");
  }

  setInterval(
    async () => {
      try {
        await deleteExpiredJobs();
      } catch (error) {
        logger.error({ error }, "Failed scheduled deleteExpiredJobs run");
      }
    },
    24 * 60 * 60 * 1000,
  );

  setInterval(
    async () => {
      try {
        const scrapedJobs = await scrapeJobListings(DEFAULT_JOB_SEARCH_QUERY);
        await storeScrapedJobs(scrapedJobs);
      } catch (error) {
        logger.error({ error }, "Failed scheduled scrape/store run");
      }
    },
    12 * 60 * 60 * 1000,
  );
}

void runScheduledJobs();
