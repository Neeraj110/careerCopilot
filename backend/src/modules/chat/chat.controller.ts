import { Request, Response, NextFunction } from "express";
import * as chatService from "./chat.service";
import {
  createChatSchema,
  sendMessageSchema,
  chatParamsSchema,
} from "./chat.schema";
import { catchAsync } from "../../utils/catchAsync";

export const createChat = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { documentId, title } = createChatSchema.parse(req.body);
  const chat = await chatService.createChat(
    req.user!.id,
    documentId,
    title,
  );
  res.status(201).json({ status: "success", data: chat });
});

export const sendMessage = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { chatId } = chatParamsSchema.parse(req.params);
  const { content } = sendMessageSchema.parse(req.body);
  const result = await chatService.sendMessage(
    req.user!.id,
    chatId,
    content,
  );
  res.status(200).json({ status: "success", data: result });
});

export const getUserChats = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const chats = await chatService.getUserChats(req.user!.id);
  res.status(200).json({ status: "success", data: chats });
});

export const getChatById = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { chatId } = chatParamsSchema.parse(req.params);
  const chat = await chatService.getChatById(req.user!.id, chatId);
  res.status(200).json({ status: "success", data: chat });
});

export const deleteChat = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { chatId } = chatParamsSchema.parse(req.params);
  const result = await chatService.deleteChat(req.user!.id, chatId);
  res.status(200).json({ status: "success", data: result });
});
