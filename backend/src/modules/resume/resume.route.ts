import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import * as resumeController from "./resume.controller";

const router = Router();

router.use(requireAuth);

router.post("/ats-check", resumeController.checkATS);

router.post("/jd-match", resumeController.jdMatch);

router.post("/improve", resumeController.improveResume);

export default router;
