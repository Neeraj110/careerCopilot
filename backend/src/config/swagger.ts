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

        // ─── Resume ─────────────────────────────────
        ATSCheckInput: {
          type: "object",
          required: ["documentId"],
          properties: {
            documentId: {
              type: "string",
              format: "uuid",
              description: "ID of the uploaded resume document",
            },
          },
        },
        ATSCheckResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            data: {
              type: "object",
              properties: {
                atsScore: { type: "integer", example: 72 },
                role: { type: "string", example: "Full Stack Developer" },
                missingKeywords: {
                  type: "array",
                  items: { type: "string" },
                  example: ["GraphQL", "Docker"],
                },
                presentKeywords: {
                  type: "array",
                  items: { type: "string" },
                  example: ["React", "Node.js", "TypeScript"],
                },
                industryTrends: {
                  type: "array",
                  items: { type: "string" },
                },
                formattingIssues: {
                  type: "array",
                  items: { type: "string" },
                },
                improvements: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      section: { type: "string" },
                      current: { type: "string" },
                      suggested: { type: "string" },
                      reason: { type: "string" },
                    },
                  },
                },
                overallFeedback: { type: "string" },
              },
            },
          },
        },
        JDMatchInput: {
          type: "object",
          required: ["documentId", "jd"],
          properties: {
            documentId: {
              type: "string",
              format: "uuid",
              description: "ID of the uploaded resume document",
            },
            jd: {
              type: "string",
              description: "Full job description text",
              example: "We are looking for a Senior React Developer...",
            },
          },
        },
        JDMatchResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            data: {
              type: "object",
              properties: {
                matchScore: { type: "integer", example: 68 },
                role: { type: "string" },
                strengths: {
                  type: "array",
                  items: { type: "string" },
                },
                missingSkills: {
                  type: "array",
                  items: { type: "string" },
                },
                partialMatches: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      required: { type: "string" },
                      candidate: { type: "string" },
                      gap: { type: "string" },
                    },
                  },
                },
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      skill: { type: "string" },
                      reason: { type: "string" },
                      resource: { type: "string" },
                    },
                  },
                },
                keywordsMissing: {
                  type: "array",
                  items: { type: "string" },
                },
                overallFeedback: { type: "string" },
              },
            },
          },
        },
        ImproveResumeInput: {
          type: "object",
          required: ["documentId", "jdText"],
          properties: {
            documentId: {
              type: "string",
              format: "uuid",
              description: "ID of the uploaded resume document",
            },
            jdText: {
              type: "string",
              description: "Job description text to tailor the resume towards",
            },
          },
        },
        ImproveResumeResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            data: {
              type: "object",
              properties: {
                originalBullets: {
                  type: "array",
                  items: { type: "string" },
                },
                improvedBullets: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      original: { type: "string" },
                      improved: { type: "string" },
                      reason: { type: "string" },
                    },
                  },
                },
                validationScore: { type: "integer", example: 82 },
                gaps: {
                  type: "object",
                  properties: {
                    missing: { type: "array", items: { type: "string" } },
                    partial: { type: "array", items: { type: "object" } },
                    present: { type: "array", items: { type: "string" } },
                  },
                },
                retryCount: { type: "integer", example: 1 },
              },
            },
          },
        },

        // ─── Roadmap ────────────────────────────────
        GenerateRoadmapInput: {
          type: "object",
          required: ["skill", "level", "targetGoal"],
          properties: {
            skill: {
              type: "string",
              example: "Next.js",
              description: "The skill to learn",
            },
            level: {
              type: "string",
              enum: ["beginner", "intermediate", "advanced"],
              example: "beginner",
            },
            targetGoal: {
              type: "string",
              example: "Build production-ready full-stack apps",
              description: "What the learner wants to achieve",
            },
          },
        },
        RoadmapResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            data: {
              type: "object",
              properties: {
                roadmap: {
                  type: "object",
                  properties: {
                    skill: { type: "string" },
                    totalWeeks: { type: "integer", example: 4 },
                    milestones: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          week: { type: "integer" },
                          focus: { type: "string" },
                          topics: {
                            type: "array",
                            items: { type: "string" },
                          },
                          resources: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                title: { type: "string" },
                                url: { type: "string" },
                                type: { type: "string" },
                              },
                            },
                          },
                          project: { type: "string" },
                          interviewQuestions: {
                            type: "array",
                            items: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
                resources: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      url: { type: "string" },
                      type: { type: "string" },
                      relevanceScore: { type: "integer" },
                      whyUseful: { type: "string" },
                    },
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
  apis: ["./src/modules/*/*.route*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
