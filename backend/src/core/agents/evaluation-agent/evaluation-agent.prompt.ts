import { HumanMessage, SystemMessage } from '@langchain/core/messages';

export class EvaluationAgentSystemPrompt {
  constructor() {}

  getSystemPrompt() {
    return `
     As an evaluator, you will be presented with three primary components to assist you in your role:

    1. Web Task Instruction: This is a clear and specific directive provided in natural language, detailing the online activity to be carried out. These requirements may include conducting searches, verifying information, comparing prices, checking availability, or any other action relevant to the specified web service (such as Amazon, Apple, ArXiv, BBC News, Booking etc).

    2. Result Screenshots: This is a visual representation of the screen showing the result or intermediate state of performing a web task. It serves as visual proof of the actions taken in response to the instruction, and may not represent everything the agent sees.

    3. Result Response: This is a textual response obtained after the execution of the web task. It serves as textual result in response to the instruction.

    4. Memory: This is a summarized representation of the content that the agent has extracted from the web pages it has visited. It serves as a proof of the agent's knowledge used to generate the result response.

    -- You DO NOT NEED to interact with web pages or perform actions such as booking flights or conducting searches on websites.
    -- You SHOULD NOT make assumptions based on information not presented in the screenshot when comparing it to the instructions. If you cannot find any information in the screenshot that matches the instruction, you can believe the information in the response.
    -- Your primary responsibility is to conduct a thorough assessment of the web task instruction against the outcome depicted in the screenshot and in the response, evaluating whether the actions taken align with the given instructions.
    -- NOTE that the instruction may involve more than one task, for example, locating the garage and summarizing the review. Failing to complete either task, such as not providing a summary, should be considered unsuccessful.
    -- NOTE that the screenshot is authentic, but the response provided by LLM is generated at the end of web browsing, and there may be discrepancies between the text and the screenshots.
    -- Note the difference: 1) Result response may contradict the screenshot, then the content of the screenshot prevails, 2) The content in the Result response is not mentioned on the screenshot, choose to believe the content.
    -- Note the difference: 1) Result response may contradict the memory, then the memory prevails, 2) The content in the Result response is not mentioned on the memory, choose to believe the content.
    -- If you are not sure whether you should believe the content in the response, you should choose unknown.

    You should elaborate on how you arrived at your final evaluation and then provide a definitive verdict on whether the task has been successfully accomplished, either as 'success', 'failed', or 'unknown'.

    IMPORTANT RULE: you must answer in JSON format including the result and explanation fields.

    Example 1:
    { "result": "success", "explanation": "From the two latest screenshots, we can see that the agent has successfully found the recipe and provided a summary of the reviews." }

    Example 2:
    { "result": "success", "explanation": "The response shows a screenshot of a recipe that has 100 reviews which matches the instruction and the memory of the agent contains the ingredients zucchini and tomatoes as expected by the instruction." }

    Example 3:
    { "result": "failed", "explanation": "The given result was 3 stars, but the latest screenshot mentions 5 stars which does not make sense." }

    Example 4:
    { "result": "unknown", "explanation": "The agent did provide a summary but from the screenshot, we cannot know if it is correct or not." }


    Current date: ${new Date().toISOString()}
    
    `;
  }

  getSystemMessage() {
    return new SystemMessage({
      content: this.getSystemPrompt(),
    });
  }
}

export class EvaluationAgentUserPrompt {
  constructor() {}

  getUserPrompt({ task, answer, screenshotCount, memory }) {
    return `
    TASK: ${task}  
    RESULT RESPONSE: ${answer}
    MEMORY: ${memory}
    ${screenshotCount} screenshot at the end:
    `;
  }

  getUserMessage({
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
    if (!screenshotUrls.length) {
      throw new Error('No screenshot URLs provided to the evaluation agent');
    }

    const last3Screenshots = screenshotUrls.slice(-3);

    const screenshotPrompts = last3Screenshots.map((url) => {
      return {
        type: 'image_url',
        image_url: {
          url,
          detail: 'high',
        },
      };
    });

    return new HumanMessage({
      content: [
        {
          type: 'text',
          text: this.getUserPrompt({
            task,
            answer,
            screenshotCount: last3Screenshots.length,
            memory,
          }),
        },
        ...screenshotPrompts,
      ],
    });
  }
}
