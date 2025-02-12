import { LLM } from '@/core/interfaces/llm.interface';
import { EvaluationResponse } from './feedback-agent.types';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import {
  EvaluationAgentSystemPrompt,
  EvaluationAgentUserPrompt,
} from './feedback-agent.prompt';

export class FeedbackAgent {
  constructor(private readonly llmService: LLM) {}

  async evaluate({
    pageUrl,
    screenshotUrls,
    task,
    answer,
  }: {
    pageUrl: string;
    screenshotUrls: string[];
    task: string;
    answer: string;
  }) {
    const systemMessage = new EvaluationAgentSystemPrompt().getSystemMessage();
    const humanMessage = new EvaluationAgentUserPrompt().getUserMessage({
      pageUrl,
      screenshotUrls,
      task,
      answer,
    });

    const parser = new JsonOutputParser<EvaluationResponse>();

    const response = await this.llmService.invokeAndParse(
      [systemMessage, humanMessage],
      parser,
    );

    console.log('EvaluationAgent response', JSON.stringify(response, null, 2));

    return response;
  }
}
