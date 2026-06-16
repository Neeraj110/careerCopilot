import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../middlewares/auth";
import * as ctrl from "./resume-v2.controller";

const router = Router();
const memUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(requireAuth);

// ── Resume CRUD ────────────────────────────────────────────────────────
router.get("/", ctrl.list);
router.post("/", ctrl.createFromDocument);
router.get("/:id", ctrl.get);
router.delete("/:id", ctrl.remove);

// ── Versions ───────────────────────────────────────────────────────────
router.get("/:id/versions/:vid", ctrl.getVersion);
router.get("/:id/diff", ctrl.diff);

// ── Analysis ───────────────────────────────────────────────────────────
router.post("/:id/analyze", ctrl.analyze);
router.get("/:id/versions/:vid/analysis", ctrl.analysisForVersion);

// ── Rewrites ───────────────────────────────────────────────────────────
router.post("/:id/rewrite", ctrl.rewrite);

export default router;
