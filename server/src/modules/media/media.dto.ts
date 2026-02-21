// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface UploadSingleDto {
  fieldName?: string; // The multipart form field name (default: 'file')
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface UploadedFileDto {
  url: string; // Cloudinary secure_url
  filename: string;
  size: number; // bytes
  mimetype: string;
}

export interface SingleUploadResponseDto {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export interface MultiUploadResponseDto {
  files: UploadedFileDto[];
}
