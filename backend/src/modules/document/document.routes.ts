import { Router } from "express";
import * as documentController from "./document.controller";
import { requireAuth } from "../../middlewares/auth";
import { upload } from "../../middlewares/upload";

const router = Router();

// All document routes require authentication
router.use(requireAuth);

router.post("/upload", upload.single("file"), documentController.uploadDocument);

router.get("/", documentController.getUserDocuments);

router.get("/:id", documentController.getDocumentById);

router.delete("/:id", documentController.deleteDocument);

export default router;
