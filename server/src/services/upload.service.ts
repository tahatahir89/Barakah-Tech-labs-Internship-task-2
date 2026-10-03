import type { UploadApiResponse } from 'cloudinary';
import { cloudinary, cloudinaryReady } from '../config/cloudinary';
import { isProd } from '../config/env';
import { AppError } from '../utils/AppError';

/** Storage adapter. Swap this file to move to S3/R2 without touching controllers. */
export function uploadImage(buffer: Buffer, folder: string, maxSize = 1600): Promise<UploadApiResponse> {
  if (!cloudinaryReady) throw new AppError(503, 'Image storage is not configured on the server.');
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `taskflow/${folder}`,
        resource_type: 'image',
        allowed_formats: ['jpg', 'png', 'webp', 'gif'],
        // Only a size cap here. Compression/format (q_auto, f_auto) is applied when the image is delivered.
        transformation: [{ width: maxSize, height: maxSize, crop: 'limit' }],
      },
      (err, result) => {
        if (err || !result) {
          console.error('Cloudinary upload failed:', err); // full detail stays in the server log
          const e = err as { message?: string; http_code?: number } | undefined;
          const detail = `${e?.message ?? 'unknown error'}${e?.http_code === 403 ? ' (run "npm run check:cloudinary" in server/ to see why)' : ''}`;
          return reject(
            new AppError(502, isProd ? 'Image storage rejected the upload. Please try again.' : `Cloudinary error: ${detail}`),
          );
        }
        resolve(result);
      },
    );
    stream.end(buffer);
  });
}

export async function deleteImage(publicId?: string) {
  if (!publicId || !cloudinaryReady) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete failed:', (err as Error).message);
  }
}
