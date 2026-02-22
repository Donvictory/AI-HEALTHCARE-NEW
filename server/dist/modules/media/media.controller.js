"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const catch_async_util_1 = require("../../utils/catch-async.util");
const api_response_util_1 = require("../../utils/api-response.util");
const app_error_util_1 = require("../../utils/app-error.util");
class MediaController {
    uploadSingle = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        if (!req.file) {
            return next(new app_error_util_1.AppError("No file uploaded", 400));
        }
        // Multer-storage-cloudinary attaches 'path' holding the secure_url
        const fileUrl = req.file.path;
        (0, api_response_util_1.sendSuccess)(res, {
            url: fileUrl,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
        }, "File uploaded successfully", 201);
    });
    uploadMultiple = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        if (!req.files || req.files.length === 0) {
            return next(new app_error_util_1.AppError("No files uploaded", 400));
        }
        const files = req.files;
        const uploadedFiles = files.map((file) => ({
            url: file.path,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
        }));
        (0, api_response_util_1.sendSuccess)(res, { files: uploadedFiles }, "Files uploaded successfully", 201);
    });
}
exports.MediaController = MediaController;
