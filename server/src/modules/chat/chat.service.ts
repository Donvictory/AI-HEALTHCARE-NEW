import { AIService } from "../ai/ai.service";
import UserModel from "../user/user.model";
import DailyCheckInModel from "../daily-check-in/daily-check-in.model";
import { AppError } from "../../utils/app-error.util";

export class ChatService {
  private aiService = new AIService();

  async chatWithContext(userId: string, userMessage: string): Promise<string> {
    const user = await UserModel.findById(userId).lean();
    if (!user) throw new AppError("User not found", 404);

    const checkIns = await DailyCheckInModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const baselineCheckIns = await DailyCheckInModel.find({ userId })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    const { calculateDrift } = await import("../../utils/health.util");
    const drift = calculateDrift(checkIns, baselineCheckIns);

    const systemPrompt = `Act as a 'Trusted Nigerian Friend' and Health Assistant for the application AI-HEALTHCARE. 
The user you are speaking to is named ${user.name}, age ${user.age || "unknown"}, gender ${user.gender || "unknown"}.
Their known health conditions are: ${user.healthConditions?.join(", ") || "None"}.
Current Health Drift: ${drift}%. (A higher drift means their health metrics are deviating negatively from their baseline).

Your tone should be warm, brotherly/sisterly, and distinctly Nigerian (e.g., using terms like 'Omo', 'Abeg', 'Chale', and mentioning local context like Lagos traffic, heat, or work stress). 

Recent daily check-ins:
${JSON.stringify(checkIns, null, 2)}

Provide health advice that is empathetic and culturally relevant. Mention the calculated 'Drift' if it's significant (>10%). 
KEEP YOUR RESPONSE UNDER 3 SENTENCES.
IMPORTANT: Do not act as a real doctor and advise them to seek professional medical help for serious issues.`;

    const messages: {
      role: "system" | "user" | "assistant";
      content: string;
    }[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ];

    return await this.aiService.chat(messages);
  }
}
