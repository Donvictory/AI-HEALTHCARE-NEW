"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const ai_service_1 = require("../ai/ai.service");
const user_model_1 = __importDefault(require("../user/user.model"));
const daily_check_in_model_1 = __importDefault(require("../daily-check-in/daily-check-in.model"));
const app_error_util_1 = require("../../utils/app-error.util");
class ChatService {
    aiService = new ai_service_1.AIService();
    async chatWithContext(userId, userMessage) {
        const user = await user_model_1.default.findById(userId).lean();
        if (!user)
            throw new app_error_util_1.AppError("User not found", 404);
        const checkIns = await daily_check_in_model_1.default.find({ userId })
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
        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
        ];
        return await this.aiService.chat(messages);
    }
}
exports.ChatService = ChatService;
