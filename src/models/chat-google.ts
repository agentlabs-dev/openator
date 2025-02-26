import { ChatGoogleGenerativeAI as ChatModel } from '@langchain/google-genai';
import { BaseMessage } from '@langchain/core/messages';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { LLM } from '@/core/types';

export type ChatGoogleGenAIConfig = {
  /**
   * The model to use.
   * @default gemini-2.0-flash
   */
  model?: 'gemini-2.0-flash' | 'gemini-2.0-flash-lite' | 'gemini-1.5-flash';
  /**
   * The API key to use.
   */
  apiKey: string;
  /**
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
};

const DEFAULT_CONFIG = {
  model: 'gemini-2.0-flash',
  temperature: 0,
  maxRetries: 6,
  maxConcurrency: 2,
} as const;

export class ChatGoogleGenAI implements LLM {
  private model: ChatModel;

  constructor(config: ChatGoogleGenAIConfig) {
    this.model = new ChatModel({
      model: config.model ?? DEFAULT_CONFIG.model,
      temperature: config.temperature ?? DEFAULT_CONFIG.temperature,
      maxRetries: config.maxRetries ?? DEFAULT_CONFIG.maxRetries,
      maxConcurrency: config.maxConcurrency ?? DEFAULT_CONFIG.maxConcurrency,
      apiKey: config.apiKey,
    });
  }

  async invokeAndParse<T extends Record<string, any>>(
    messages: BaseMessage[],
    parser: JsonOutputParser<T>,
  ): Promise<T> {
    const response = await this.model.invoke(messages);

    console.log('response', JSON.stringify(response, null, 2));

    return parser.invoke(response);
  }
}
