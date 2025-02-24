import { LLM } from '../interfaces/llm.interface';
import { HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';
export type AgentTool = {
    name: string;
    description: string;
    usage: string;
};
export type AgentBaseConfig = {
    role: string;
    goal: string;
    backstory: string;
    tools: AgentTool[];
    llm: LLM;
    strictJsonOutput: boolean;
    responseSchema: z.ZodSchema;
};
export declare class Agent<ResponseType> {
    private readonly config;
    readonly backstory: string;
    readonly goal: string;
    readonly tools: AgentTool[];
    readonly role: string;
    readonly strictJsonOutput: boolean;
    readonly responseSchema: z.ZodSchema;
    constructor(config: AgentBaseConfig);
    private getSystemPrompt;
    private getUserTaskPrompt;
    private getSystemMessage;
    private getHumanMessage;
    perform(task: AgentTask): Promise<any>;
}
export type AgentTaskConfig = {
    description: string;
    goal: string;
    expectedOutput: string;
    validOutputExamples: string;
    invalidOutputExamples: string;
};
export declare class AgentTask {
    private readonly config;
    private input;
    private images;
    private memory;
    constructor(config: AgentTaskConfig);
    prepare(params: {
        images?: string[];
        memory?: string;
        input: string;
    }): void;
    getTaskPrompt(): string;
    getTaskMessages(): HumanMessage[];
}
