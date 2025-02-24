import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { JsonOutputParser } from '@langchain/core/output_parsers';
export class Agent {
    constructor(config) {
        this.config = config;
        this.backstory = config.backstory;
        this.goal = config.goal;
        this.tools = config.tools;
        this.role = config.role;
        this.strictJsonOutput = config.strictJsonOutput;
        this.responseSchema = config.responseSchema;
    }
    getSystemPrompt() {
        return `
      You are a ${this.role}

      ${this.backstory}

      ${this.goal}

      ${this.tools}

      ${this.strictJsonOutput ? 'IMPORTANT: your output must always be a valid JSON object.' : ''}
    `;
    }
    getUserTaskPrompt(task) {
        return task.getTaskPrompt();
    }
    getSystemMessage() {
        return new SystemMessage({
            content: this.getSystemPrompt(),
        });
    }
    getHumanMessage(task) {
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
    async perform(task) {
        const messages = [this.getSystemMessage(), this.getHumanMessage(task)];
        const parser = new JsonOutputParser();
        const response = await this.config.llm.invokeAndParse(messages, parser);
        return response;
    }
}
export class AgentTask {
    constructor(config) {
        this.config = config;
    }
    prepare(params) {
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
        const images = this.images.map((image) => {
            return {
                type: 'image_url',
                image_url: {
                    url: image,
                },
            };
        });
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
//# sourceMappingURL=agent-base.js.map