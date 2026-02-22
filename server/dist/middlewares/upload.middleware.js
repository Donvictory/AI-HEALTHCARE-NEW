"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedia = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_config_1 = __importDefault(require("../config/cloudinary.config"));
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_config_1.default,
    params: async (req, file) => {
        // Defines the folder where the files will be saved in Cloudinary
        return {
            folder: "discover_io_media",
            allowed_formats: ["jpg", "jpeg", "png", "pdf", "mp4"],
            public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
        };
    },
});
exports.uploadMedia = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit
    },
});
