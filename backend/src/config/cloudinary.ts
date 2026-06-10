import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { config } from "./index";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadToCloudinary = (
  buffer: Buffer,
  options: any,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    // this is for upload image to cloudinary by using buffer
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    // we are using streamifier to create a read stream from buffer
    // and pipe it to the cloudinary upload stream
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const removeFromCloudinary = async (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
