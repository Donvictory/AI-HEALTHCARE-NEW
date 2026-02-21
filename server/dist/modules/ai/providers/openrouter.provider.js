"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterProvider = void 0;
const openai_1 = __importDefault(require("openai"));
const app_config_1 = __importDefault(require("../../../config/app.config"));
const app_error_util_1 = require("../../../utils/app-error.util");
class OpenRouterProvider {
    openai;
    constructor() {
        if (!app_config_1.default.ai.openRouteApiKey)
            throw new app_error_util_1.AppError("OpenRouter API key is not configured", 500);
        this.openai = new openai_1.default({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: app_config_1.default.ai.openRouteApiKey,
        });
    }
    async normalize(input, structure) {
        try {
            const response = await this.openai.chat.completions.create({
                model: "google/gemini-2.5-flash",
                messages: [
                    {
                        role: "system",
                        content: `Normalize the input into a structured JSON matching: ${JSON.stringify(structure)}. Return ONLY valid JSON.`,
                    },
                    { role: "user", content: input },
                ],
                response_format: { type: "json_object" },
            });
            const result = response.choices[0].message.content;
            if (!result)
                throw new app_error_util_1.AppError("Failed to get response from OpenRouter", 500);
            return JSON.parse(result);
        }
        catch (error) {
            console.error("OpenRouter Error:", error);
            throw new app_error_util_1.AppError(`AI Processing failed: ${error.message}`, error.status || 500);
        }
    }
}
exports.OpenRouterProvider = OpenRouterProvider;
