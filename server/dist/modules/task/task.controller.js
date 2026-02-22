"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const task_service_1 = require("./task.service");
const catch_async_util_1 = require("../../utils/catch-async.util");
const api_response_util_1 = require("../../utils/api-response.util");
const service = new task_service_1.TaskService();
class TaskController {
    /**
     * GET /api/v1/tasks
     * Gets or generates today's tasks for the user
     */
    getDailyTasks = (0, catch_async_util_1.catchAsync)(async (req, res) => {
        const tasks = await service.getValidDailyTasks(req.user.id);
        (0, api_response_util_1.sendSuccess)(res, { tasks }, "Daily tasks retrieved", 200);
    });
    /**
     * PATCH /api/v1/tasks/:id/complete
     * Marks a task as completed
     */
    completeTask = (0, catch_async_util_1.catchAsync)(async (req, res) => {
        const task = await service.completeTask(req.user.id, req.params.id);
        (0, api_response_util_1.sendSuccess)(res, { task }, "Task marked as completed", 200);
    });
    /**
     * POST /api/v1/tasks/generate
     * Force regenerates tasks (if needed)
     */
    regenerateTasks = (0, catch_async_util_1.catchAsync)(async (req, res) => {
        const tasks = await service.generateDailyTasks(req.user.id);
        (0, api_response_util_1.sendSuccess)(res, { tasks }, "Daily tasks regenerated", 201);
    });
}
exports.TaskController = TaskController;
