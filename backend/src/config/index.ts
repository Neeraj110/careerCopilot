import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 7000,
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  groqApiKey: process.env.GROQ_API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  mistralApiKey: process.env.MISTRAL_API_KEY || "",
  tavilyApiKey: process.env.TAVILY_API_KEY || "",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  backendUrl: process.env.BACKEND_URL || "http://localhost:7000",
};
