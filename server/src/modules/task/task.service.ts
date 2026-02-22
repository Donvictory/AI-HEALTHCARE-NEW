import { AIService } from "../ai/ai.service";
import TaskModel from "./task.model";
import DailyCheckInModel from "../daily-check-in/daily-check-in.model";
import UserModel from "../user/user.model";
import { AppError } from "../../utils/app-error.util";
import { ITaskEntity } from "./task.entity";

export class TaskService {
  private aiService = new AIService();

  async getValidDailyTasks(userId: string): Promise<ITaskEntity[]> {
    // 1. Get tasks created today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayTasks = await TaskModel.find({
      userId,
      createdAt: { $gte: startOfDay },
    }).lean();

    // 2. Return if they already have tasks
    if (todayTasks.length > 0) return todayTasks as unknown as ITaskEntity[];

    // 3. Otherwise, generate new tasks
    return this.generateDailyTasks(userId);
  }

  async generateDailyTasks(userId: string): Promise<ITaskEntity[]> {
    const user = await UserModel.findById(userId).lean();
    if (!user) throw new AppError("User not found", 404);

    // Get recent 5 checkins + all medical reports in those check-ins
    const recentCheckIns = await DailyCheckInModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const medicalReports = recentCheckIns
      .flatMap((c) => c.medicalReports || [])
      .filter((url) => !!url); // We just list the URLs indicating they submitted reports,
    // real ingestion of reading files could happen if integrated with Vision models.

    // Provide context to AI
    const profileContext = `Age: ${user.age || "Unknown"}, Gender: ${
      user.gender || "Unknown"
    }, Health Conditions: ${user.healthConditions?.join(", ") || "None"}`;

    const metricsText = recentCheckIns
      .map(
        (c: any) =>
          `Date: ${new Date(c.createdAt || Date.now()).toLocaleDateString()}, Status: ${c.currentHealthStatus}, Symptoms: ${
            c.symptomsToday?.join(", ") || "None"
          }, Reports: ${c.medicalReports?.length || 0} attached`,
      )
      .join("\n");

    const prompt = `Based on the following user profile and their recent daily check-in habits:
Profile: ${profileContext}
Recent check-ins:
${metricsText || "No recent history"}
Medical Reports Uploaded: ${medicalReports.length} recently.

Generate exactly 3 simple, actionable health tasks the user should perform today. They should be clear and realistic.`;

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

      const tasksToInsert = result.tasks.slice(0, 3).map((t: any) => ({
        userId,
        title: t.title,
        description: t.description,
        isCompleted: false,
      }));

      // Insert into DB
      const inserted = await TaskModel.insertMany(tasksToInsert);
      return inserted.map((doc) => doc.toObject()) as unknown as ITaskEntity[];
    } catch (error: any) {
      console.error("Task Generation Error:", error);
      throw new AppError("Failed to generate daily tasks", 500);
    }
  }

  async completeTask(userId: string, taskId: string): Promise<ITaskEntity> {
    const task = await TaskModel.findOneAndUpdate(
      { _id: taskId, userId },
      { isCompleted: true },
      { new: true },
    ).lean();

    if (!task) throw new AppError("Task not found or not owned by user", 404);
    return task as unknown as ITaskEntity;
  }
}
