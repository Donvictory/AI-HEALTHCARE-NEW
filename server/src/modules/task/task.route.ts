import { Router } from "express";
import { TaskController } from "./task.controller";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();
const controller = new TaskController();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Daily health tasks management
 */

router.use(protect);

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get today's daily health tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily tasks retrieved
 */
router.get("/", controller.getDailyTasks);

/**
 * @swagger
 * /api/v1/tasks/{id}/complete:
 *   patch:
 *     summary: Mark a health task as completed
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task marked as completed
 */
router.patch("/:id/complete", controller.completeTask);

/**
 * @swagger
 * /api/v1/tasks/generate:
 *   post:
 *     summary: Force regenerate daily health tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Tasks regenerated
 */
router.post("/generate", controller.regenerateTasks);

export default router;
