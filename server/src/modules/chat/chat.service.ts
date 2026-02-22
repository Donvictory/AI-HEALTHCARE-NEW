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

    const systemPrompt = `You are an AI Health Assistant for the application AI-HEALTHCARE. 
The user you are speaking to is named ${user.name}, age ${user.age || "unknown"}, gender ${user.gender || "unknown"}.
Their known health conditions are: ${user.healthConditions?.join(", ") || "None"}.
Their recent daily check-ins:
${JSON.stringify(checkIns, null, 2)}

Provide a VERY SHORT, helpful, concise, and empathetic response to their query based on this context. 
KEEP YOUR RESPONSE UNDER 3 SENTENCES.
IMPORTANT: Do not act as a real doctor and advise them to seek professional medical help if it's an emergency or serious issue.`;

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
