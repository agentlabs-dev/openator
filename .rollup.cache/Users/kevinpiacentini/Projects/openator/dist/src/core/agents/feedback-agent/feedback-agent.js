import { JsonOutputParser } from '@langchain/core/output_parsers';
import { EvaluationAgentSystemPrompt, EvaluationAgentUserPrompt, } from './feedback-agent.prompt';
export class FeedbackAgent {
    constructor(llmService) {
        this.llmService = llmService;
    }
    async evaluate({ pageUrl, screenshotUrls, task, answer, taskHistorySummary, previousTaskResult, }) {
        const systemMessage = new EvaluationAgentSystemPrompt().getSystemMessage();
        const humanMessage = new EvaluationAgentUserPrompt().getUserMessage({
            pageUrl,
            screenshotUrls,
            task,
            answer,
            taskHistorySummary,
            previousTaskResult,
        });
        const parser = new JsonOutputParser();
        const response = await this.llmService.invokeAndParse([systemMessage, humanMessage], parser);
        console.log('FeedbackAgent response', JSON.stringify(response, null, 2));
        return response;
    }
}
//# sourceMappingURL=feedback-agent.js.map