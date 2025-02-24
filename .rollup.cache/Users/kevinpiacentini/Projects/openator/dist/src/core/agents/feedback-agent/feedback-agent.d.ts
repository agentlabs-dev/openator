import { LLM } from '@/core/interfaces/llm.interface';
export declare class FeedbackAgent {
    private readonly llmService;
    constructor(llmService: LLM);
    evaluate({ pageUrl, screenshotUrls, task, answer, taskHistorySummary, previousTaskResult, }: {
        pageUrl: string;
        screenshotUrls: string[];
        task: string;
        answer: string;
        previousTaskResult: string;
        taskHistorySummary: string;
    }): Promise<{
        result?: "unknown" | "failed" | "success";
        explanation?: string;
        hint?: string;
        memoryLearning?: string;
    }>;
}
