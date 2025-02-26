import { LLM } from '../interfaces/llm.interface';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

/**
 * This is an experimental implementation of an agent.
 * It is not used in the current version of the application.
 */

export type AgentTool = {
  name: string;
  description: string;
  usage: string;
};

export type AgentBaseConfig = {
  role: string;
  goal: string;
  backstory: string;
  tools: AgentTool[];
  llm: LLM;
  strictJsonOutput: boolean;
  responseSchema: z.ZodSchema;
};

export class Agent<ResponseType> {
  public readonly backstory: string;
  public readonly goal: string;
  public readonly tools: AgentTool[];
  public readonly role: string;
  public readonly strictJsonOutput: boolean;
  public readonly responseSchema: z.ZodSchema;

  constructor(private readonly config: AgentBaseConfig) {
    this.backstory = config.backstory;
    this.goal = config.goal;
    this.tools = config.tools;
    this.role = config.role;
    this.strictJsonOutput = config.strictJsonOutput;
    this.responseSchema = config.responseSchema;
  }

  private getSystemPrompt() {
    return `
      You are a ${this.role}

      ${this.backstory}

      ${this.goal}

      ${this.tools}

      ${this.strictJsonOutput ? 'IMPORTANT: your output must always be a valid JSON object.' : ''}
    `;
  }

  private getUserTaskPrompt(task: AgentTask) {
    return task.getTaskPrompt();
  }

  private getSystemMessage() {
    return new SystemMessage({
      content: this.getSystemPrompt(),
    });
  }

  private getHumanMessage(task: AgentTask) {
    return new HumanMessage({
      content: [
        {
          role: 'user',
          type: 'text',
          text: this.getUserTaskPrompt(task),
        },
      ],
    });
  }

  async perform(task: AgentTask) {
    const messages = [this.getSystemMessage(), this.getHumanMessage(task)];

    type ResponseType = z.infer<typeof this.responseSchema>;

    const parser = new JsonOutputParser<ResponseType>();

    const response = await this.config.llm.invokeAndParse(messages, parser);

    return response;
  }
}

export type AgentTaskConfig = {
  description: string;
  goal: string;
  expectedOutput: string;
  validOutputExamples: string;
  invalidOutputExamples: string;
};

export class AgentTask {
  private input: string;
  private images: string[] | undefined;
  private memory: string | undefined;

  constructor(private readonly config: AgentTaskConfig) {}

  prepare(params: { images?: string[]; memory?: string; input: string }) {
    this.input = params.input;
    this.images = params.images;
    this.memory = params.memory;
  }

  getTaskPrompt() {
    return `    
      # Task description:
      ${this.config.description}

      # Task goal:
      ${this.config.goal}

      # Expected output:
      ${this.config.expectedOutput}

      # Example valid outputs:
      ${this.config.validOutputExamples};

      # Example invalid outputs:
      ${this.config.invalidOutputExamples}

      # Images:
      ${this.images} at the end

      # Memory:
      ${this.memory}

      # User input:
      ${this.input}
    `;
  }

  getTaskMessages() {
    const images =
      this.images?.map((image) => {
        return {
          type: 'image_url',
          image_url: {
            url: image,
          },
        };
      }) ?? [];

    return [
      new HumanMessage({
        content: [
          {
            type: 'text',
            text: this.getTaskPrompt(),
          },
          ...images,
        ],
      }),
    ];
  }
}
