"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("./chat.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const controller = new chat_controller_1.ChatController();
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
router.post("/", auth_middleware_1.protect, controller.ask);
exports.default = router;
