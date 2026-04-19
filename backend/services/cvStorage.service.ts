import fs from "node:fs";
import dotenv from "dotenv";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { logger } from "../libs/logger.js";

dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  logger.error("Cloudinary credentials are missing in .env file");
}

cloudinary.config(
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET
    ? {
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
      }
    : {},
);

export type UploadedCv = {
  publicId: string;
  secureUrl: string;
  originalFilename: string;
  bytes: number;
  format: string;
  resourceType: string;
};

export type UploadOptions = {
  folder?: string;
  resource_type?: "image" | "video" | "raw" | "auto";
  public_id?: string;
  overwrite?: boolean;
  transformation?: Record<string, unknown>[];
};

export async function uploadOnCloudinary(
  localFilePath: string,
  options: UploadOptions = {},
): Promise<UploadApiResponse | null> {
  try {
    if (!localFilePath) {
      return null;
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      ...options,
    });

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    logger.error({ error }, "Cloudinary upload error");
    return null;
  }
}

export async function deleteOnCloudinary(
  url: string,
): Promise<{ result: string } | null> {
  try {
    if (!url) {
      return null;
    }

    const parts = url.split("/");
    const publicIdWithExt = parts.slice(-2).join("/");
    const publicId = publicIdWithExt.split(".")[0];

    if (!publicId) {
      return null;
    }

    let resourceType: "image" | "video" | "raw" = "image";

    if (url.includes("/video/")) {
      resourceType = "video";
    } else if (url.includes("/raw/")) {
      resourceType = "raw";
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return { result: result.result };
  } catch (error) {
    logger.error({ error }, "Cloudinary delete error");
    throw error;
  }
}

export function uploadCvToCloudinary(
  file: Express.Multer.File,
  folder = "jobfinder/cv",
): Promise<UploadedCv> {
  return (async () => {
    if (!file.path) {
      throw new Error(
        "Temp file path is missing. Ensure multer diskStorage is configured.",
      );
    }

    const result = await uploadOnCloudinary(file.path, {
      folder,
      resource_type: "raw",
      public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
      overwrite: false,
    });

    if (!result) {
      throw new Error("Cloudinary upload failed");
    }

    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
      originalFilename: file.originalname,
      bytes: result.bytes,
      format: result.format,
      resourceType: result.resource_type,
    };
  })();
}

export async function deleteCvFromCloudinary(url: string): Promise<void> {
  const result = await deleteOnCloudinary(url);
  if (!result) {
    throw new Error("Cloudinary delete failed");
  }

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error("Cloudinary delete failed");
  }
}
