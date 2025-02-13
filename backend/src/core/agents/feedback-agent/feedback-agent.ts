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
    taskHistorySummary,
    previousTaskResult,
  }: {
    pageUrl: string;
    screenshotUrls: string[];
    task: string;
    answer: string;
    previousTaskResult: string;
    taskHistorySummary: string;
  }) {
    const systemMessage = new EvaluationAgentSystemPrompt().getSystemMessage();
    const humanMessage = new EvaluationAgentUserPrompt().getUserMessage({
      pageUrl,
      screenshotUrls,
      task,
      answer,
      taskHistorySummary,
      previousTaskResult,
    });

    const parser = new JsonOutputParser<EvaluationResponse>();

    const response = await this.llmService.invokeAndParse(
      [systemMessage, humanMessage],
      parser,
    );

    console.log('FeedbackAgent response', JSON.stringify(response, null, 2));

    return response;
  }
}
