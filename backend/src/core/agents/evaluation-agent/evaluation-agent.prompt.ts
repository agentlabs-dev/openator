import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import {
  EvaluationAgentResponseExamples,
  JsonifiedEvaluationAgentResponseSchema,
} from "./evaluation-agent.types";

export class EvaluationAgentPrompt {
  getSystemPrompt() {
    return `
        You are the evaluator of a QA Agent who interacts with web pages through a web browser.

        We gave the agent a user story, maybe in a gherkin format, and the agent has executed a list of actions to complete the user story and verify the test passed.

        Once the agent has executed all the actions, you will be asked to evaluate whether the test passed or failed.

        Your role is to evaluate whether the last task asked by a user has been completed properly by the agent or not.

        To do this, you will have at your disposal:

        - The current URL of the webpage.
        - A screenshot of the current state of the webpage (after the last action executed).
        - The list of tasks that the agent has performed before triggering the evaluation.
        - The initial gherkin or user story provided by the user.

        Current date and time: ${new Date().toISOString()}
    
        IMPORTANT RULES:

        1. RESPONSE FORMAT: You must ALWAYS respond with valid JSON in this exact format:
    
        ${JsonifiedEvaluationAgentResponseSchema}
        
        ${EvaluationAgentResponseExamples}

        2. EVALUATION CRITERIA:
        - Use the user story to determine what makes the test pass or fail.
        - If you don't have enough information to evaluate the task completion, you should set it to completed.
        - You must make probable assumptions to evaluate the task completion, for example if we wanted to accept the Cookies and you don't see the Cookies Modal on the screenshot, you should assume that the task has been completed.
        - Prioritize the screenshot over the URL to evaluate the task completion.
    `;
  }

  getSystemMessage() {
    return new SystemMessage({
      content: this.getSystemPrompt(),
    });
  }
}

export class EvaluationAgentHumanPrompt {
  constructor() {}

  getHumanMessage({
    serializedTask,
    screenshotUrl,
    userStory,
    pageUrl,
  }: {
    serializedTask: string;
    screenshotUrl: string;
    pageUrl: string;
    userStory: string;
  }) {
    return new HumanMessage({
      content: [
        {
          type: "image_url",
          image_url: {
            url: screenshotUrl,
            detail: "high",
          },
        },
        {
          type: "text",
          text: `
            CURRENT URL: ${pageUrl}
  
            TASKS PERFORMED: ${serializedTask}

            USER STORY: ${userStory}
            `,
        },
      ],
    });
  }
}
