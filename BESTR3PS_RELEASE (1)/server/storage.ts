import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface IStorageService {
  saveImage(buffer: Buffer, extension: string): Promise<string>;
  deleteImage(imageUrl: string): Promise<void>;
}

export class S3ObjectStorageService implements IStorageService {
  private endpoint: string;
  private bucket: string;
  private accessKey: string;
  private secretKey: string;
  private publicUrl: string;

  constructor(config: { endpoint: string; bucket: string; accessKey: string; secretKey: string; publicUrl?: string }) {
    this.endpoint = config.endpoint;
    this.bucket = config.bucket;
    this.accessKey = config.accessKey;
    this.secretKey = config.secretKey;
    this.publicUrl = config.publicUrl || `${config.endpoint}/${config.bucket}`;
  }

  async saveImage(buffer: Buffer, extension: string): Promise<string> {
    const filename = `img_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${extension}`;
    const uploadUrl = `${this.endpoint.replace(/\/$/, '')}/${this.bucket}/${filename}`;
    
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg',
          'Authorization': `AWS ${this.accessKey}:${this.secretKey}`,
        },
        body: new Uint8Array(buffer)
      });
      if (!response.ok) {
        throw new Error(`S3 upload returned HTTP ${response.status}`);
      }
      return `${this.publicUrl.replace(/\/$/, '')}/${filename}`;
    } catch (err) {
      console.error('Remote object storage upload failed, saving locally:', err);
      return new LocalDiskStorageService(path.join(__dirname, '..', 'data_store', 'uploads')).saveImage(buffer, extension);
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const filename = path.basename(imageUrl);
    const deleteUrl = `${this.endpoint.replace(/\/$/, '')}/${this.bucket}/${filename}`;
    try {
      await fetch(deleteUrl, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to delete image from S3 storage:', e);
    }
  }
}

export class LocalDiskStorageService implements IStorageService {
  private uploadsDir: string;

  constructor(uploadsDir: string) {
    this.uploadsDir = uploadsDir;
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async saveImage(buffer: Buffer, extension: string): Promise<string> {
    const filename = `img_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${extension}`;
    const filepath = path.join(this.uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);
    return `/uploads/${filename}`;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl.startsWith('/uploads/')) return;
    const filename = path.basename(imageUrl);
    const filepath = path.join(this.uploadsDir, filename);
    if (fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
      } catch (err) {
        console.warn(`Could not delete local file ${filepath}:`, err);
      }
    }
  }
}

let storageInstance: IStorageService | null = null;

export function getStorageService(): IStorageService {
  if (storageInstance) return storageInstance;

  const endpoint = process.env.STORAGE_ENDPOINT;
  const bucket = process.env.STORAGE_BUCKET_NAME;
  const accessKey = process.env.STORAGE_ACCESS_KEY;
  const secretKey = process.env.STORAGE_SECRET_KEY;
  const publicUrl = process.env.STORAGE_PUBLIC_URL;

  if (endpoint && bucket && accessKey && secretKey) {
    console.log(`✓ Using S3-compatible Object Storage on bucket: ${bucket}`);
    storageInstance = new S3ObjectStorageService({
      endpoint,
      bucket,
      accessKey,
      secretKey,
      publicUrl
    });
    return storageInstance;
  }

  const localUploadsDir = path.join(__dirname, '..', 'data_store', 'uploads');
  storageInstance = new LocalDiskStorageService(localUploadsDir);
  return storageInstance;
}
