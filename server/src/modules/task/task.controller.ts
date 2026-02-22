import { Request, Response, NextFunction } from "express";
import { TaskService } from "./task.service";
import { catchAsync } from "../../utils/catch-async.util";
import { sendSuccess } from "../../utils/api-response.util";

const service = new TaskService();

export class TaskController {
  /**
   * GET /api/v1/tasks
   * Gets or generates today's tasks for the user
   */
  getDailyTasks = catchAsync(async (req: Request, res: Response) => {
    const tasks = await service.getValidDailyTasks(req.user.id);
    sendSuccess(res, { tasks }, "Daily tasks retrieved", 200);
  });

  /**
   * PATCH /api/v1/tasks/:id/complete
   * Marks a task as completed
   */
  completeTask = catchAsync(async (req: Request, res: Response) => {
    const task = await service.completeTask(
      req.user.id,
      req.params.id as string,
    );
    sendSuccess(res, { task }, "Task marked as completed", 200);
  });

  /**
   * POST /api/v1/tasks/generate
   * Force regenerates tasks (if needed)
   */
  regenerateTasks = catchAsync(async (req: Request, res: Response) => {
    const tasks = await service.generateDailyTasks(req.user.id);
    sendSuccess(res, { tasks }, "Daily tasks regenerated", 201);
  });
}
