import { HumanMessage, SystemMessage } from '@langchain/core/messages';
export declare class EvaluationAgentSystemPrompt {
    constructor();
    getSystemPrompt(): string;
    getSystemMessage(): SystemMessage;
}
export declare class EvaluationAgentUserPrompt {
    constructor();
    getUserPrompt({ pageUrl, task, answer, screenshotCount, taskHistorySummary, previousTaskResult, }: {
        pageUrl: any;
        task: any;
        answer: any;
        screenshotCount: any;
        taskHistorySummary: any;
        previousTaskResult: any;
    }): string;
    getUserMessage({ pageUrl, screenshotUrls, task, answer, taskHistorySummary, previousTaskResult, }: {
        pageUrl: string;
        screenshotUrls: string[];
        task: string;
        answer: string;
        taskHistorySummary: string;
        previousTaskResult: string;
    }): HumanMessage;
}
