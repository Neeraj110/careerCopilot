import { Router } from "express";
import * as chatController from "./chat.controller";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// All chat routes require authentication
router.use(requireAuth);

router.post("/", chatController.createChat);
router.patch("/:chatId", chatController.updateChat);

router.post("/:chatId/message", chatController.sendMessage);

router.get("/", chatController.getUserChats);

router.get("/:chatId", chatController.getChatById);

router.delete("/:chatId", chatController.deleteChat);

export default router;
