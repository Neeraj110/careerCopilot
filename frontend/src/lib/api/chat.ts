import { api } from "../api";
import type { ApiResponse, Chat, ChatWithMessages, Message } from "@/types";

export const chatApi = {
  create: (data: { documentId?: string; title?: string }) =>
    api.post<ApiResponse<Chat>>("/chats", data),

  getAll: () => api.get<ApiResponse<Chat[]>>("/chats"),

  getById: (chatId: string) =>
    api.get<ApiResponse<ChatWithMessages>>(`/chats/${chatId}`),

  delete: (chatId: string) =>
    api.delete<{ message: string }>(`/chats/${chatId}`),

  update: (
    chatId: string,
    data: { documentId?: string | null; title?: string },
  ) => api.patch<ApiResponse<Chat>>(`/chats/${chatId}`, data),

  sendMessage: (
    chatId: string,
    message: string,
    documentId?: string | null,
  ) =>
    api.post<ApiResponse<Message>>(`/chats/${chatId}/message`, {
      content: message,
      documentId,
    }),
};
