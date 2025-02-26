import { ChatOllama as ChatModel } from '@langchain/ollama';
import { BaseMessage } from '@langchain/core/messages';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { LLM } from '@/core/types';

export type ChatOllamaConfig = {
  /**
   * The model to use.
   */
  model: 'qwen2.5' | 'llama3.2';
  /**
   * The base URL of the Ollama server.
   * @default http://localhost:11434
   */
  baseUrl?: string;
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
};

const DEFAULT_CONFIG = {
  model: 'qwen2.5',
  baseUrl: 'http://localhost:11434',
  temperature: 0,
  maxRetries: 6,
  maxConcurrency: 2,
} as const;

export class ChatOllama implements LLM {
  private model: ChatModel;

  constructor(config: ChatOllamaConfig) {
    this.model = new ChatModel({
      model: config.model ?? DEFAULT_CONFIG.model,
      temperature: config.temperature ?? DEFAULT_CONFIG.temperature,
      maxRetries: config.maxRetries ?? DEFAULT_CONFIG.maxRetries,
      maxConcurrency: config.maxConcurrency ?? DEFAULT_CONFIG.maxConcurrency,
      baseUrl: config.baseUrl ?? DEFAULT_CONFIG.baseUrl,
      format: 'json',
    });
  }

  async invokeAndParse<T extends Record<string, any>>(
    messages: BaseMessage[],
    parser: JsonOutputParser<T>,
  ): Promise<T> {
    const response = await this.model.invoke(messages);

    return parser.invoke(response);
  }
}
