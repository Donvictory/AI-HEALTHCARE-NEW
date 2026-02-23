// ─── Request DTOs ─────────────────────────────────────────────────────────────

export class AIRequestDto {
  prompt!: string;
  schema?: Record<string, unknown>; // JSON schema for structured output
  provider?: string; // Override default provider (e.g. 'openrouter')
  model?: string; // Override model (e.g. 'openai/gpt-4o')
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export class AIResponseDto {
  result!: unknown; // Parsed structured output or raw text
  provider!: string;
  model!: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}
