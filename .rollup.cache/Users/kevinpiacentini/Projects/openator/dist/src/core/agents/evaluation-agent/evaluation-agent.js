import { JsonOutputParser } from '@langchain/core/output_parsers';
import { EvaluationAgentSystemPrompt, EvaluationAgentUserPrompt, } from './evaluation-agent.prompt';
export class EvaluationAgent {
    constructor(llmService) {
        this.llmService = llmService;
    }
    async evaluate({ screenshotUrls, task, answer, memory, }) {
        const systemMessage = new EvaluationAgentSystemPrompt().getSystemMessage();
        const humanMessage = new EvaluationAgentUserPrompt().getUserMessage({
            screenshotUrls,
            task,
            answer,
            memory,
        });
        const parser = new JsonOutputParser();
        const response = await this.llmService.invokeAndParse([systemMessage, humanMessage], parser);
        console.log('EvaluationAgent response', JSON.stringify(response, null, 2));
        return response;
    }
}
//# sourceMappingURL=evaluation-agent.js.map