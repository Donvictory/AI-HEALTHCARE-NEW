export interface IAIProvider {
  normalize(input: string, structure: any): Promise<any>;
}
