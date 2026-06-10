import { api, streamSSE, type SSECallbacks } from "../api";
import type { ApiResponse, Chat, ChatWithMessages } from "@/types";

export const chatApi = {
  create: (data: { documentId?: string; title?: string }) =>
    api.post<ApiResponse<Chat>>("/chats", data),

  getAll: () => api.get<ApiResponse<Chat[]>>("/chats"),

  getById: (chatId: string) =>
    api.get<ApiResponse<ChatWithMessages>>(`/chats/${chatId}`),

  delete: (chatId: string) =>
    api.delete<{ message: string }>(`/chats/${chatId}`),

  sendMessage: (
    chatId: string,
    message: string,
    callbacks: SSECallbacks,
  ) =>
    streamSSE(`/chats/${chatId}/message`, { content: message }, callbacks),
};
