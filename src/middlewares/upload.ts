import multer from 'multer';

// Use memory storage since we want to pass the buffer directly to Cloudinary or parse it in memory (e.g. PDF parsing)
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max size
  },
});
