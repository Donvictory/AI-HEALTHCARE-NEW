import { IAIProvider } from "./ai.provider";
import { OpenRouterProvider } from "./providers/openrouter.provider";
import appConfig from "../../config/app.config";
import { AppError } from "../../utils/app-error.util";

export class AIService {
  private providers: Map<string, IAIProvider> = new Map();
  private cache: Map<string, any> = new Map();

  constructor() {
    this.providers.set("openrouter", new OpenRouterProvider());
  }

  async normalize(
    input: string,
    structure: any,
    providerName: string = "openrouter",
  ): Promise<any> {
    const cacheKey = `${providerName}:${input}:${JSON.stringify(structure)}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const provider = this.providers.get(providerName);
    if (!provider) throw new AppError(`AI Provider not found`, 404);

    const result = await provider.normalize(input, structure);
    this.cache.set(cacheKey, result);
    return result;
  }
}
