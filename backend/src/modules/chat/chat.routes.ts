import { Router } from "express";
import * as chatController from "./chat.controller";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// All chat routes require authentication
router.use(requireAuth);

/**
 * @swagger
 * /chats:
 *   post:
 *     summary: Create a new chat session
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateChatInput'
 *     responses:
 *       201:
 *         description: Chat created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Chat'
 *       404:
 *         description: Document not found (if documentId provided)
 *       401:
 *         description: Unauthorized
 */
router.post("/", chatController.createChat);

/**
 * @swagger
 * /chats/{chatId}/message:
 *   post:
 *     summary: Send a message and get AI response (RAG)
 *     description: |
 *       Embeds the user's question, searches ChromaDB for relevant document chunks,
 *       builds context with chat history, and calls Gemini for an answer.
 *       Returns both the user message and AI response with source references.
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageInput'
 *     responses:
 *       200:
 *         description: AI response with sources
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatMessageResponse'
 *       404:
 *         description: Chat not found
 *       401:
 *         description: Unauthorized
 */
router.post("/:chatId/message", chatController.sendMessage);

/**
 * @swagger
 * /chats:
 *   get:
 *     summary: Get all chats for the authenticated user
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's chats
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
 *                     $ref: '#/components/schemas/Chat'
 *       401:
 *         description: Unauthorized
 */
router.get("/", chatController.getUserChats);

/**
 * @swagger
 * /chats/{chatId}:
 *   get:
 *     summary: Get a chat with all messages
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat with messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Chat'
 *                     - type: object
 *                       properties:
 *                         messages:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Message'
 *                         document:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             id:
 *                               type: string
 *                             title:
 *                               type: string
 *                             status:
 *                               type: string
 *       404:
 *         description: Chat not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:chatId", chatController.getChatById);

/**
 * @swagger
 * /chats/{chatId}:
 *   delete:
 *     summary: Delete a chat and its messages
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat deleted
 *       404:
 *         description: Chat not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:chatId", chatController.deleteChat);

export default router;
