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

    // Provide comprehensive context to AI
    const bmi =
      user.height && user.weight
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
      .map(
        (c: any) =>
          `Date: ${new Date(c.createdAt || Date.now()).toLocaleDateString()}
           - Sleep: ${c.hoursSlept}h, Stress: ${c.stressLevel}/10, Mood: ${c.currentMood}/10
           - Activity: ${c.dailyActivityMeasure} mins, Water: ${c.numOfWaterGlasses} glasses
           - Health Status: ${c.currentHealthStatus}
           - Symptoms: ${c.symptomsToday?.join(", ") || "None"}
           - Lifestyle: ${c.lifestyleChecks?.join(", ") || "No flags"}
           - Reports: ${c.medicalReports?.length || 0} attached`,
      )
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
