import OpenAI from "openai";
import { IAIProvider } from "../ai.provider";
import { appConfig } from "../../../config/app.config";
import { AppError } from "../../../utils/app-error.util";

export class OpenRouterProvider implements IAIProvider {
  private openai: OpenAI;

  constructor() {
    if (!appConfig.ai.openRouteApiKey)
      throw new AppError("OpenRouter API key is not configured", 500);

    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: appConfig.ai.openRouteApiKey,
    });
  }

  async normalize(input: string, structure: any): Promise<any> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Normalize the input into a structured JSON matching: ${JSON.stringify(
              structure,
            )}. Return ONLY valid JSON.`,
          },
          { role: "user", content: input },
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
      });

      const result = response.choices[0].message.content;
      if (!result)
        throw new AppError("Failed to get response from OpenRouter", 500);

      return JSON.parse(result);
    } catch (error: any) {
      console.error("OpenRouter Error:", error);
      throw new AppError(
        `AI Processing failed: ${error.message}`,
        error.status || 500,
      );
    }
  }

  async chat(
    messages: { role: "system" | "user" | "assistant"; content: string }[],
  ): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 300,
      });

      const result = response.choices[0].message.content;
      if (!result)
        throw new AppError("Failed to get response from OpenRouter", 500);

      return result;
    } catch (error: any) {
      console.error("OpenRouter Chat Error:", error);
      throw new AppError(
        `AI Chat failed: ${error.message}`,
        error.status || 500,
      );
    }
  }
}
