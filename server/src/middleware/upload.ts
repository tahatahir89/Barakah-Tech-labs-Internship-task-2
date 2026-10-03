import multer from 'multer';
import { AppError } from '../utils/AppError';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

/** Single image, kept in memory (serverless has no writable disk) and streamed to Cloudinary. */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 1 }, // Vercel caps request bodies at ~4.5 MB
  fileFilter: (_req, file, cb) =>
    ALLOWED.has(file.mimetype) ? cb(null, true) : cb(new AppError(400, 'Only JPG, PNG, WebP or GIF images are allowed.')),
}).single('image');
