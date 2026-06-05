import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smart Desk API",
      version: "1.0.0",
      description: "Smart Desk RAG System — Document Analysis & AI Chat API",
    },
    servers: [
      {
        url: "/api/v1",
        description: "API v1",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // ─── Auth ──────────────────────────────────
        RegisterInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", minLength: 6, example: "secret123" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", example: "secret123" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            data: {
              type: "object",
              properties: {
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    email: { type: "string" },
                  },
                },
                token: { type: "string" },
              },
            },
          },
        },
        UserProfile: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // ─── Document ──────────────────────────────
        Document: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            title: { type: "string" },
            fileUrl: { type: "string" },
            publicId: { type: "string" },
            type: { type: "string", enum: ["PDF", "DOCX", "TXT"] },
            status: { type: "string", enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        DocumentWithChunks: {
          allOf: [
            { $ref: "#/components/schemas/Document" },
            {
              type: "object",
              properties: {
                chunks: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Chunk" },
                },
                _count: {
                  type: "object",
                  properties: {
                    chats: { type: "integer" },
                  },
                },
              },
            },
          ],
        },
        Chunk: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            documentId: { type: "string", format: "uuid" },
            content: { type: "string" },
            metadata: { type: "object", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        // ─── Chat ──────────────────────────────────
        CreateChatInput: {
          type: "object",
          properties: {
            documentId: { type: "string", format: "uuid", description: "Optional — scope chat to a specific document" },
            title: { type: "string" },
          },
        },
        SendMessageInput: {
          type: "object",
          required: ["content"],
          properties: {
            content: { type: "string", example: "What are the key points in this document?" },
          },
        },
        Chat: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            documentId: { type: "string", format: "uuid", nullable: true },
            title: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Message: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            chatId: { type: "string", format: "uuid" },
            role: { type: "string", enum: ["USER", "AI", "SYSTEM"] },
            content: { type: "string" },
            sources: {
              type: "array",
              nullable: true,
              items: {
                type: "object",
                properties: {
                  documentId: { type: "string" },
                  chunkId: { type: "string" },
                  chunkIndex: { type: "integer" },
                },
              },
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ChatMessageResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            data: {
              type: "object",
              properties: {
                userMessage: {
                  type: "object",
                  properties: {
                    role: { type: "string", example: "USER" },
                    content: { type: "string" },
                  },
                },
                aiMessage: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    role: { type: "string", example: "AI" },
                    content: { type: "string" },
                    sources: { type: "array", items: { type: "object" } },
                  },
                },
              },
            },
          },
        },

        // ─── Common ────────────────────────────────
        SuccessResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            data: { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            statusCode: { type: "integer" },
            message: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/modules/*/*.routes.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
