import { Request, Response, NextFunction } from "express";
import * as chatService from "./chat.service";
import {
  createChatSchema,
  sendMessageSchema,
  chatParamsSchema,
} from "./chat.schema";

export const createChat = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { documentId, title } = createChatSchema.parse(req.body);
    const chat = await chatService.createChat(
      (req as any).user.id,
      documentId,
      title
    );
    res.status(201).json({ status: "success", data: chat });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId } = chatParamsSchema.parse(req.params);
    const { content } = sendMessageSchema.parse(req.body);
    const result = await chatService.sendMessage(
      (req as any).user.id,
      chatId,
      content
    );
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

export const getUserChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const chats = await chatService.getUserChats((req as any).user.id);
    res.status(200).json({ status: "success", data: chats });
  } catch (error) {
    next(error);
  }
};

export const getChatById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId } = chatParamsSchema.parse(req.params);
    const chat = await chatService.getChatById((req as any).user.id, chatId);
    res.status(200).json({ status: "success", data: chat });
  } catch (error) {
    next(error);
  }
};

export const deleteChat = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId } = chatParamsSchema.parse(req.params);
    const result = await chatService.deleteChat((req as any).user.id, chatId);
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};
