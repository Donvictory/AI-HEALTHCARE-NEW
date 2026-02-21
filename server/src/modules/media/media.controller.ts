import { Request, Response, NextFunction } from "express";
import { catchAsync } from "@/utils/catch-async.util";
import { sendSuccess } from "@/utils/api-response.util";
import { AppError } from "@/utils/app-error.util";

// Temporary interface until @types/multer resolves
interface MulterRequest extends Request {
  file?: any;
  files?: any[];
}

export class MediaController {
  uploadSingle = catchAsync(
    async (req: MulterRequest, res: Response, next: NextFunction) => {
      if (!req.file) {
        return next(new AppError("No file uploaded", 400));
      }

      // Multer-storage-cloudinary attaches 'path' holding the secure_url
      const fileUrl = req.file.path;

      sendSuccess(
        res,
        {
          url: fileUrl,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
        "File uploaded successfully",
        201,
      );
    },
  );

  uploadMultiple = catchAsync(
    async (req: MulterRequest, res: Response, next: NextFunction) => {
      if (!req.files || req.files.length === 0) {
        return next(new AppError("No files uploaded", 400));
      }

      const files = req.files;
      const uploadedFiles = files.map((file: any) => ({
        url: file.path,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
      }));

      sendSuccess(
        res,
        { files: uploadedFiles },
        "Files uploaded successfully",
        201,
      );
    },
  );
}
