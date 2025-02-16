import { LLM } from '../interfaces/llm.interface';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';
import { JsonOutputParser } from '@langchain/core/output_parsers';

/**
 * This is an experimental implementation of an agent.
 * It is not used in the current version of the application.
 */

export type AgentBaseConfig = {
  role: string;
  goal: string;
  backstory: string;
  llm: LLM;
  strictJsonOutput: boolean;
  fewShotExamples: string[];
  responseSchema: z.ZodSchema;
};

export class ChatAgentBase {
  public readonly backstory: string;
  public readonly goal: string;
  public readonly role: string;
  public readonly strictJsonOutput: boolean;
  public readonly responseSchema: z.ZodSchema;
  public readonly fewShotExamples: string[];

  private readonly messages: ChatMessage[] = [];

  constructor(private readonly config: AgentBaseConfig) {
    this.backstory = config.backstory;
    this.goal = config.goal;
    this.role = config.role;
    this.strictJsonOutput = config.strictJsonOutput;
    this.responseSchema = config.responseSchema;
    this.fewShotExamples = config.fewShotExamples;

    this.addMessage(
      new ChatMessage({
        role: 'system',
        text: this.getSystemPrompt(),
        images: [],
      }),
    );
  }

  private jsonResponseSchema() {
    return zodToJsonSchema(this.responseSchema);
  }

  private getSystemPrompt() {
    return `
    # Role
    You are a ${this.role}

    # Backstory
    ${this.backstory}

    # Goal
    ${this.goal}

    # Strict JSON Output
    ${this.strictJsonOutput ? 'IMPORTANT: your output must always be a valid JSON object and only a valid JSON object.' : ''}

    # Response Schema
    Here is the JSON Schema of the expected response schema: 

    \`\`\`json
    ${this.jsonResponseSchema}
    \`\`\`

    # Currente date is:
    ${new Date().toISOString()}

    # Examples
    ${this.fewShotExamples.join('\n')}
    `;
  }

  /**
   * Returns an answer based on the current conversation state.
   * Requires to push a new message to the conversation before calling this method.
   */
  public async answer(): Promise<z.infer<typeof this.responseSchema>> {
    const messages = this.messages.map((message) =>
      message.toLangchainMessage(),
    );

    const llm = this.config.llm;

    const parser = new JsonOutputParser<z.infer<typeof this.responseSchema>>();

    const result = await llm.invokeAndParse(messages, parser);

    return result;
  }

  public addMessage(message: ChatMessage) {
    this.messages.push(message);
  }
}

export type ChatMessageConfig = {
  role: 'user' | 'system';
  text: string;
  images: string[];
};

export class ChatMessage {
  private readonly role: 'user' | 'system';
  private readonly text: string;
  private readonly images: string[];

  constructor(private readonly _config: ChatMessageConfig) {
    this.role = _config.role;
    this.text = _config.text;
    this.images = _config.images;
  }

  public toLangchainMessage() {
    const content = {
      content: [
        {
          type: 'text',
          text: this.text,
        },
        ...this.images.map((image) => ({
          type: 'image_url',
          image_url: {
            url: image,
          },
        })),
      ],
    };

    if (this.role === 'user') {
      return new HumanMessage(content);
    }

    return new SystemMessage(content);
  }
}
