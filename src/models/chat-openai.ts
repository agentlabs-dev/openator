import { ChatOpenAI as LChatOpenAI } from '@langchain/openai';
import { BaseMessage } from '@langchain/core/messages';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { LLM } from '@/core/types';

export type ChatOpenAIConfig = {
  /**
   * The model to use.
   * @default gpt-4o
   */
  model?: 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4-turbo';
  /**
   * The temperature to use. We recommend setting this to 0 for consistency.
   * @default 0
   */
  temperature?: number;
  /**
   * The maximum number of retries.
   * This is usefull when you have a low quota such as Tier 1 or 2.
   * @default 6
   */
  maxRetries?: number;
  /**
   * The maximum number of concurrent requests.
   * Set it to a low value if you have a low quota such as Tier 1 or 2.
   * @default 2
   */
  maxConcurrency?: number;
  /**
   * The OpenAI API key to use
   */
  apiKey: string;
};

const DEFAULT_CONFIG = {
  model: 'gpt-4o',
  temperature: 0,
  maxRetries: 6,
  maxConcurrency: 2,
} as const;

export class ChatOpenAI implements LLM {
  private model: LChatOpenAI;

  constructor(config: ChatOpenAIConfig) {
    this.model = new LChatOpenAI({
      model: config.model ?? DEFAULT_CONFIG.model,
      temperature: config.temperature ?? DEFAULT_CONFIG.temperature,
      openAIApiKey: config.apiKey,
      maxRetries: config.maxRetries ?? DEFAULT_CONFIG.maxRetries,
      maxConcurrency: config.maxConcurrency ?? DEFAULT_CONFIG.maxConcurrency,
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
