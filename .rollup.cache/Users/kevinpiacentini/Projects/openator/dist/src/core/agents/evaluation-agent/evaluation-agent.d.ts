import { LLM } from '@/core/interfaces/llm.interface';
export declare class EvaluationAgent {
    private readonly llmService;
    constructor(llmService: LLM);
    evaluate({ screenshotUrls, task, answer, memory, }: {
        screenshotUrls: string[];
        task: string;
        answer: string;
        memory: string;
    }): Promise<{
        result: "unknown" | "failed" | "success";
        explanation: string;
    }>;
}
