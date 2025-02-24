import { HumanMessage, SystemMessage } from '@langchain/core/messages';
export declare class ManagerAgentPrompt {
    private readonly maxActionPerStep;
    constructor(maxActionPerStep: number);
    importantRules(): string;
    inputFormat(): string;
    getSystemPrompt(): string;
    getSystemMessage(): SystemMessage;
}
export declare class ManagerAgentHumanPrompt {
    constructor();
    getHumanMessage({ memoryLearnings, serializedTasks, stringifiedDomState, screenshotUrl, pristineScreenshotUrl, pageUrl, pixelAbove, pixelBelow, }: {
        memoryLearnings: string;
        serializedTasks: string;
        stringifiedDomState: string;
        screenshotUrl: string;
        pristineScreenshotUrl: string;
        pageUrl: string;
        pixelAbove: number;
        pixelBelow: number;
    }): HumanMessage;
}
