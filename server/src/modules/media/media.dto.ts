// ─── Request DTOs ─────────────────────────────────────────────────────────────

export class UploadSingleDto {
  fieldName?: string; // The multipart form field name (default: 'file')
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export class UploadedFileDto {
  url!: string; // Cloudinary secure_url
  filename!: string;
  size!: number; // bytes
  mimetype!: string;
}

export class SingleUploadResponseDto {
  url!: string;
  filename!: string;
  size!: number;
  mimetype!: string;
}

export class MultiUploadResponseDto {
  files!: UploadedFileDto[];
}
