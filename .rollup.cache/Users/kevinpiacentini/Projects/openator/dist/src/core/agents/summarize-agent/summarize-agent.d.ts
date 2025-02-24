import { Agent, AgentTask } from '../agent-base';
import { z } from 'zod';
import { LLM } from '@/core/interfaces/llm.interface';
declare const responseSchema: z.ZodObject<{
    takeaways: z.ZodString;
}, "strip", z.ZodTypeAny, {
    takeaways?: string;
}, {
    takeaways?: string;
}>;
export type SummarizeAgent = Agent<z.infer<typeof responseSchema>>;
export declare const initSummarizer: (openAiApiKey: string, llm: LLM) => Agent<unknown>;
export declare const initSummarizeTask: () => AgentTask;
export {};
