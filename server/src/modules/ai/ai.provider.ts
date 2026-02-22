export interface IAIProvider {
  normalize(input: string, structure: any): Promise<any>;
  chat(
    messages: { role: "system" | "user" | "assistant"; content: string }[],
  ): Promise<string>;
}
