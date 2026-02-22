"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const ai_service_1 = require("../ai/ai.service");
const task_model_1 = __importDefault(require("./task.model"));
const daily_check_in_model_1 = __importDefault(require("../daily-check-in/daily-check-in.model"));
const user_model_1 = __importDefault(require("../user/user.model"));
const app_error_util_1 = require("../../utils/app-error.util");
class TaskService {
    aiService = new ai_service_1.AIService();
    async getValidDailyTasks(userId) {
        // 1. Get tasks created today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const todayTasks = await task_model_1.default.find({
            userId,
            createdAt: { $gte: startOfDay },
        }).lean();
        // 2. Return if they already have tasks
        if (todayTasks.length > 0)
            return todayTasks;
        // 3. Otherwise, generate new tasks
        return this.generateDailyTasks(userId);
    }
    async generateDailyTasks(userId) {
        const user = await user_model_1.default.findById(userId).lean();
        if (!user)
            throw new app_error_util_1.AppError("User not found", 404);
        // Get recent 5 checkins + all medical reports in those check-ins
        const recentCheckIns = await daily_check_in_model_1.default.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();
        const medicalReports = recentCheckIns
            .flatMap((c) => c.medicalReports || [])
            .filter((url) => !!url); // We just list the URLs indicating they submitted reports,
        // real ingestion of reading files could happen if integrated with Vision models.
        // Provide comprehensive context to AI
        const bmi = user.height && user.weight
            ? (user.weight / Math.pow(user.height / 100, 2)).toFixed(1)
            : "Unknown";
        const profileContext = `
      User Profile:
      - Name: ${user.name}
      - Age: ${user.age || "Unknown"}
      - Gender: ${user.gender || "Unknown"}
      - BMI: ${bmi} (${user.weight}kg, ${user.height}cm)
      - Health Conditions: ${user.healthConditions?.length ? user.healthConditions.join(", ") : "None reported"}
      - Family Health History: ${user.familyHealthHistory?.length ? user.familyHealthHistory.join(", ") : "None reported"}
      - Current Health Points: ${user.healthPoints || 0}
    `;
        const metricsText = recentCheckIns
            .map((c) => `Date: ${new Date(c.createdAt || Date.now()).toLocaleDateString()}
           - Sleep: ${c.hoursSlept}h, Stress: ${c.stressLevel}/10, Mood: ${c.currentMood}/10
           - Activity: ${c.dailyActivityMeasure} mins, Water: ${c.numOfWaterGlasses} glasses
           - Health Status: ${c.currentHealthStatus}
           - Symptoms: ${c.symptomsToday?.join(", ") || "None"}
           - Lifestyle: ${c.lifestyleChecks?.join(", ") || "No flags"}
           - Reports: ${c.medicalReports?.length || 0} attached`)
            .join("\n\n");
        const prompt = `
      You are an Expert AI Health Coach. 
      Analyze the following comprehensive user health data and history:
      
      ${profileContext}
      
      RECENT HISTORY (Last 5 Check-ins):
      ${metricsText || "No recent history available."}
      
      UPLOADED MEDICAL REPORTS:
      Total recent uploads: ${medicalReports.length}
      
      TASK GENERATION GOAL:
      Based on this specific data, generate 3 highly personalized, intelligent, and context-driven daily health tasks. 
      - If they haven't been sleeping well, suggest sleep hygiene.
      - If they have specific health conditions, suggest relevant management tasks.
      - If their lifestyle checks show skipped meals or no exercise, address that.
      - If they are stressed, suggest mindfulness.
      
      Return 3 simple, actionable tasks with a title and a descriptive instruction.
    `;
        const structure = {
            tasks: [
                {
                    title: "Drink 2L Water",
                    description: "Stay hydrated throughout the day.",
                },
            ],
        };
        try {
            const result = await this.aiService.normalize(prompt, structure);
            if (!result.tasks || !Array.isArray(result.tasks)) {
                throw new Error("Invalid AI payload");
            }
            const tasksToInsert = result.tasks.slice(0, 3).map((t) => ({
                userId,
                title: t.title,
                description: t.description,
                isCompleted: false,
            }));
            // Insert into DB
            const inserted = await task_model_1.default.insertMany(tasksToInsert);
            return inserted.map((doc) => doc.toObject());
        }
        catch (error) {
            console.error("Task Generation Error:", error);
            throw new app_error_util_1.AppError("Failed to generate daily tasks", 500);
        }
    }
    async completeTask(userId, taskId) {
        const task = await task_model_1.default.findOneAndUpdate({ _id: taskId, userId }, { isCompleted: true }, { new: true }).lean();
        if (!task)
            throw new app_error_util_1.AppError("Task not found or not owned by user", 404);
        return task;
    }
}
exports.TaskService = TaskService;
