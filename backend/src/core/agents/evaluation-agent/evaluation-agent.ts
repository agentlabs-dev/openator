import { LLM } from '@/core/interfaces/llm.interface';
import { EvaluationResponse } from './evaluation-agent.types';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import {
  EvaluationAgentSystemPrompt,
  EvaluationAgentUserPrompt,
} from './evaluation-agent.prompt';

export class EvaluationAgent {
  constructor(private readonly llmService: LLM) {}

  async evaluate({
    screenshotUrls,
    task,
    answer,
    memory,
  }: {
    screenshotUrls: string[];
    task: string;
    answer: string;
    memory: string;
  }) {
    const systemMessage = new EvaluationAgentSystemPrompt().getSystemMessage();
    const humanMessage = new EvaluationAgentUserPrompt().getUserMessage({
      screenshotUrls,
      task,
      answer,
      memory,
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
