import { HumanMessage, SystemMessage } from '@langchain/core/messages';
export declare class EvaluationAgentSystemPrompt {
    constructor();
    getSystemPrompt(): string;
    getSystemMessage(): SystemMessage;
}
export declare class EvaluationAgentUserPrompt {
    constructor();
    getUserPrompt({ task, answer, screenshotCount, memory }: {
        task: any;
        answer: any;
        screenshotCount: any;
        memory: any;
    }): string;
    getUserMessage({ screenshotUrls, task, answer, memory, }: {
        screenshotUrls: string[];
        task: string;
        answer: string;
        memory: string;
    }): HumanMessage;
}
