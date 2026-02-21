import { Router } from "express";
import { MediaController } from "./media.controller";
import { uploadMedia } from "../../middlewares/upload.middleware";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();
const mediaController = new MediaController();

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: Media upload management
 */

/**
 * @swagger
 * /api/v1/media/upload/single:
 *   post:
 *     summary: Upload a single media file
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     filename:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     mimetype:
 *                       type: string
 *       400:
 *         description: No file uploaded or unsupported format
 */
router.post(
  "/upload/single",
  protect,
  uploadMedia.single("file"),
  mediaController.uploadSingle.bind(mediaController),
);

/**
 * @swagger
 * /api/v1/media/upload/multiple:
 *   post:
 *     summary: Upload multiple media files
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                           filename:
 *                             type: string
 *                           size:
 *                             type: integer
 *                           mimetype:
 *                             type: string
 */
router.post(
  "/upload/multiple",
  protect,
  uploadMedia.array("files", 10), // Limit to 10 files
  mediaController.uploadMultiple.bind(mediaController),
);

export default router;
