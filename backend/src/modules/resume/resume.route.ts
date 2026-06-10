import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import * as resumeController from "./resume.controller";

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * /resume/ats-check:
 *   post:
 *     summary: Run ATS analysis on an uploaded resume
 *     description: |
 *       Analyzes the resume document against current ATS standards using
 *       Google Search grounding for real-time industry data. Returns a score,
 *       missing/present keywords, formatting issues, and improvement suggestions.
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ATSCheckInput'
 *     responses:
 *       200:
 *         description: ATS analysis result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ATSCheckResponse'
 *       404:
 *         description: Document not found
 *       400:
 *         description: Document still processing
 *       401:
 *         description: Unauthorized
 */
router.post("/ats-check", resumeController.checkATS);

/**
 * @swagger
 * /resume/jd-match:
 *   post:
 *     summary: Match resume against a job description
 *     description: |
 *       Compares the uploaded resume against a provided job description.
 *       Returns match score, strengths, missing skills, partial matches,
 *       and actionable recommendations.
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JDMatchInput'
 *     responses:
 *       200:
 *         description: JD match analysis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JDMatchResponse'
 *       404:
 *         description: Document not found
 *       400:
 *         description: Document still processing
 *       401:
 *         description: Unauthorized
 */
router.post("/jd-match", resumeController.jdMatch);

/**
 * @swagger
 * /resume/improve:
 *   post:
 *     summary: Improve resume bullets using a LangGraph agent
 *     description: |
 *       Runs a multi-step LangGraph agent that parses resume bullets,
 *       analyzes the JD, finds gaps, rewrites bullets with ATS keywords,
 *       and validates the output (with retry loop if score < 70).
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ImproveResumeInput'
 *     responses:
 *       200:
 *         description: Improved resume bullets with validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImproveResumeResponse'
 *       404:
 *         description: Document not found
 *       400:
 *         description: Document still processing
 *       401:
 *         description: Unauthorized
 */
router.post("/improve", resumeController.improveResume);

export default router;
