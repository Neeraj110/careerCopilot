/// <reference types="multer" />
import { prisma } from "../../infrastructure/prisma";
import { embedTexts } from "../../infrastructure/embeddings";
import {
  uploadToCloudinary,
  removeFromCloudinary,
} from "../../config/cloudinary";
import { AppError } from "../../middlewares/errorHandler";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { v4 as uuidv4 } from "uuid";

// ─── Text Extraction ─────────────────────────────────────────────

export const extractText = async (
  buffer: Buffer,
  mimeType: string,
): Promise<string> => {
  if (mimeType === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    try {
      const data = await parser.getText();
      return data.text;
    } finally {
      await parser.destroy();
    }
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimeType === "text/plain") {
    return buffer.toString("utf-8");
  }

  throw new AppError("Unsupported file type", 400);
};

// ─── Detect DocType enum value from mime ─────────────────────────

const getDocType = (mimeType: string): "PDF" | "DOCX" | "TXT" => {
  if (mimeType === "application/pdf") return "PDF";
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "DOCX";
  if (mimeType === "text/plain") return "TXT";
  throw new AppError("Unsupported file type", 400);
};

// ─── Upload + Process Document ───────────────────────────────────

export const uploadDocument = async (
  userId: string,
  title: string,
  file: Express.Multer.File,
) => {
  const docType = getDocType(file.mimetype);

  // 1. Upload file to Cloudinary
  const cloudinaryResult: any = await uploadToCloudinary(file.buffer, {
    folder: "smart-desk/documents",
    resource_type: "raw",
    public_id: `${uuidv4()}_${file.originalname}`,
  });

  // 2. Create Document record in Postgres (PENDING)
  const document = await prisma.document.create({
    data: {
      userId,
      title,
      fileUrl: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      type: docType,
      status: "PENDING",
    },
  });

  // 3. Process in background (don't await — return immediately)
  processDocument(document.id, file.buffer, file.mimetype).catch((err) => {
    console.error(`[Document Processing Error] docId=${document.id}:`, err);
  });

  return document;
};

// ─── Background Processing Pipeline ─────────────────────────────

const processDocument = async (
  documentId: string,
  buffer: Buffer,
  mimeType: string,
) => {
  try {
    // Mark as PROCESSING
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "PROCESSING" },
    });

    // 1. Extract text from file
    const text = await extractText(buffer, mimeType);

    if (!text.trim()) {
      throw new Error("No text content extracted from document");
    }

    // 2. Split into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await splitter.splitText(text);

    // 3. Generate embeddings for all chunks
    const vectors = await embedTexts(chunks);

    // 4. Store chunks and vectors in Postgres
    await Promise.all(
      chunks.map(async (content, index) => {
        const id = uuidv4();
        const vectorStr = `[${vectors[index].join(",")}]`;
        const metadataStr = JSON.stringify({ chunkIndex: index, totalChunks: chunks.length });
        
        await prisma.$executeRaw`
          INSERT INTO "Chunk" (id, "documentId", content, metadata, embedding, "createdAt")
          VALUES (${id}, ${documentId}, ${content}, ${metadataStr}::jsonb, ${vectorStr}::vector, NOW())
        `;
      }),
    );

    // 6. Mark as COMPLETED
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "COMPLETED" },
    });

    console.log(
      `[Document Processed] docId=${documentId}, chunks=${chunks.length}`,
    );
  } catch (error) {
    // Delete from Cloudinary to save space since it failed
    try {
      const doc = await prisma.document.findUnique({
        where: { id: documentId },
      });
      if (doc?.publicId) {
        await removeFromCloudinary(doc.publicId);
      }
    } catch (cleanupError) {
      console.error(
        `[Cloudinary Cleanup Error] docId=${documentId}:`,
        cleanupError,
      );
    }

    // Mark as FAILED on any error
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "FAILED" },
    });

    await prisma.document.delete({
      where: { id: documentId },
    });
    throw error;
  }
};

// ─── Get User's Documents ────────────────────────────────────────

export const getUserDocuments = async (userId: string) => {
  return prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { chunks: true, chats: true } },
    },
  });
};

// ─── Get Single Document ─────────────────────────────────────────

export const getDocumentById = async (userId: string, documentId: string) => {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
    include: {
      chunks: true,
      _count: { select: { chats: true } },
    },
  });

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  return document;
};

// ─── Delete Document ─────────────────────────────────────────────

export const deleteDocument = async (userId: string, documentId: string) => {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
    include: { chunks: { select: { id: true } } },
  });

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  // Vectors are stored in Postgres Chunk table, which cascades on Document delete.

  // 2. Remove file from Cloudinary
  try {
    await removeFromCloudinary(document.publicId);
  } catch (err) {
    console.error("[Cloudinary Delete Error]:", err);
  }

  // 3. Delete from Postgres (cascades to chunks + chats)
  await prisma.document.delete({ where: { id: documentId } });

  return { message: "Document deleted successfully" };
};
