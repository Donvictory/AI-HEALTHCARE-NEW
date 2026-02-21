"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const openrouter_provider_1 = require("../../modules/ai/providers/openrouter.provider");
const app_error_util_1 = require("../../utils/app-error.util");
class AIService {
    providers = new Map();
    cache = new Map();
    constructor() {
        this.providers.set("openrouter", new openrouter_provider_1.OpenRouterProvider());
    }
    async normalize(input, structure, providerName = "openrouter") {
        const cacheKey = `${providerName}:${input}:${JSON.stringify(structure)}`;
        if (this.cache.has(cacheKey))
            return this.cache.get(cacheKey);
        const provider = this.providers.get(providerName);
        if (!provider)
            throw new app_error_util_1.AppError(`AI Provider not found`, 404);
        const result = await provider.normalize(input, structure);
        this.cache.set(cacheKey, result);
        return result;
    }
}
exports.AIService = AIService;
