// roadmap.routes.ts
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { generateRoadmap, listRoadmaps, getRoadmap } from "./roadmap.controller";

const router = Router();
router.use(requireAuth);

router.post("/generate", generateRoadmap);
router.get("/", listRoadmaps);
router.get("/:id", getRoadmap);

export default router;