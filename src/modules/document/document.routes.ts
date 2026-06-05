import { Router } from "express";
import * as documentController from "./document.controller";
import { requireAuth } from "../../middlewares/auth";
import { upload } from "../../middlewares/upload";

const router = Router();

// All document routes require authentication
router.use(requireAuth);

/**
 * @swagger
 * /documents/upload:
 *   post:
 *     summary: Upload a document (PDF, DOCX, or TXT)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - title
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF, DOCX, or TXT file (max 10MB)
 *               title:
 *                 type: string
 *                 description: Document title
 *     responses:
 *       201:
 *         description: Document uploaded — processing in background
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Document uploaded. Processing will continue in background.
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *       400:
 *         description: Missing file, unsupported type, or validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/upload", upload.single("file"), documentController.uploadDocument);

/**
 * @swagger
 * /documents:
 *   get:
 *     summary: Get all documents for the authenticated user
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 *       401:
 *         description: Unauthorized
 */
router.get("/", documentController.getUserDocuments);

/**
 * @swagger
 * /documents/{id}:
 *   get:
 *     summary: Get a single document with its chunks
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document details with chunks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/DocumentWithChunks'
 *       404:
 *         description: Document not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", documentController.getDocumentById);

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     summary: Delete a document (removes file, vectors, and DB records)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted
 *       404:
 *         description: Document not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", documentController.deleteDocument);

export default router;
