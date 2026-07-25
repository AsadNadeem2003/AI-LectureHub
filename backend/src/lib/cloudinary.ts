import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

/**
 * Upload a local file to Cloudinary CDN and return its secure URL.
 */
export async function uploadToCloudinary(
  filePath: string,
  folder: string = 'lecturehub/documents'
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const isConfigured =
    cloudName &&
    apiKey &&
    apiSecret &&
    !cloudName.includes('your_') &&
    !apiKey.includes('your_') &&
    !apiSecret.includes('your_');

  if (isConfigured) {
    try {
      const result = await Promise.race([
        cloudinary.uploader.upload(filePath, { folder, resource_type: 'auto' }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Cloudinary upload timeout')), 5000)
        ),
      ]);
      return (result as any).secure_url;
    } catch (error) {
      console.warn('⚠️ Cloudinary upload failed or timed out, using local file URL fallback:', error);
    }
  }

  // Fallback if Cloudinary is not configured or fails: serve local file relative path
  const filename = path.basename(filePath);
  return `/uploads/${filename}`;
}

export { cloudinary };
