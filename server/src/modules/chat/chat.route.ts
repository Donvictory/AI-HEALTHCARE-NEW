import { Router } from "express";
import { ChatController } from "./chat.controller";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();
const controller = new ChatController();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: AI-assisted health chat
 */

/**
 * @swagger
 * /api/v1/chat:
 *   post:
 *     summary: Ask the AI health assistant a question
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat response generated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, controller.ask);

export default router;
