import { ChatOpenAI } from '@langchain/openai';
import { BaseMessage } from '@langchain/core/messages';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import 'dotenv/config';
import { LLM } from '@/core/interfaces/llm.interface';

export class OpenAI4o implements LLM {
  private model: ChatOpenAI;

  constructor(openAiApiKey: string) {
    this.model = new ChatOpenAI({
      model: 'gpt-4o',
      temperature: 0,
      openAIApiKey: openAiApiKey,
    });
  }

  async invokeAndParse<T extends Record<string, any>>(
    messages: BaseMessage[],
    parser: JsonOutputParser<T>,
  ): Promise<T> {
    const response = await this.model.invoke(messages, {
      response_format: { type: 'json_object' },
    });

    return parser.invoke(response);
  }
}
