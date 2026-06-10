// roadmap.routes.ts
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { generateRoadmap } from "./roadmap.controller";

const router = Router();
router.use(requireAuth);

/**
 * @swagger
 * /roadmap/generate:
 *   post:
 *     summary: Generate a personalized learning roadmap
 *     description: |
 *       Runs a 4-node LangGraph pipeline:
 *       1. **Query Generator** — creates targeted search queries
 *       2. **Web Searcher** — fetches real resources via Tavily
 *       3. **Resource Ranker** — selects and scores the best 8
 *       4. **Roadmap Formatter** — builds a week-by-week plan with projects and interview questions
 *     tags: [Roadmap]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerateRoadmapInput'
 *     responses:
 *       200:
 *         description: Generated learning roadmap
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoadmapResponse'
 *       401:
 *         description: Unauthorized
 */
router.post("/generate", generateRoadmap);

export default router;