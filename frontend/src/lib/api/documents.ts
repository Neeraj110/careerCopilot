import { api } from "../api";
import type { ApiResponse, Document } from "@/types";

export const documentsApi = {
  upload: (file: File, title: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    return api.upload<ApiResponse<Document>>("/documents/upload", formData);
  },

  getAll: () => api.get<ApiResponse<Document[]>>("/documents"),

  getById: (id: string) => api.get<ApiResponse<Document>>(`/documents/${id}`),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/documents/${id}`),
};
