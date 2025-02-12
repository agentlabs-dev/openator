import {
  JsonifiedManagerResponseSchema,
  ManagerResponseExamples,
} from "@/core/agents/manager-agent/manager-agent.types";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export class ManagerAgentPrompt {
  constructor(private readonly maxActionPerStep: number) {}

  importantRules() {
    return `
  1. RESPONSE FORMAT: You must ALWAYS respond with valid JSON in this exact format:
  
  ${JsonifiedManagerResponseSchema}
  
  ${ManagerResponseExamples}
  
  2. ACTIONS: You can specify multiple actions in the list to be executed in sequence. But always specify only one action name per item.
  
     Common action sequences:
  
     // Form filling
     actions: [
        { "name": "fillInput", "params": { "index": 1, "text": "{{user_email}}" } },
        { "name": "fillInput", "params": { "index": 2, "text": "{{user_password}}" } },
        { "name": "fillInput", "params": { "index": 5, "text": "13 street name, 123456 city, country" } },
        { "name": "fillInput", "params": { "index": 6, "text": "1234567890" } },
        { "name": "scrollDown", "params": {} },
      ]
  
     // Flow that does not work
     actions: [
        { "name": "clickElement", "params": { "index": 2 } },
        { "name": "clickElement", "params": { "index": 2 } },
        { "name": "clickElement", "params": { "index": 2 } },
        { "name": "clickElement", "params": { "index": 2 } },
      ]
  
  
      "index" corresponds to the index of the element you see on the screenshot.
      Never use other indexes than the ones provided in the element list.

      Example with wrong index:
      actions: [
        { "name": "fillInput", "params": { "index": "allow all", "text": "username" } },
        { "name": "fillInput", "params": { "index": "accept", "text": "password" } },        
      ]
  
      - NEVER plan to trigger a success or failure action among other actions, you should always trigger a success or failure action alone.
      - NEVER plan to do something after a scroll action since the page will change.
      - NEVER plan to scroll down or up if there is a cookie popup or any constent popup on screen. First accept or close the popup.
      - When the page is truncated, scroll down to view more elements especially if you are filling a form.
      - Trigger success means you have completed the task and we can ask the evaluator to evaluate the test result.
      - Trigger failure means you have failed the task and you don't know how to complete the scenario.
      - Sometimes, the user will provide variables surrounded by double brackets {{}}. You should keep them exactly as they are, we will replace them with the actual value later.

      Wrong example (trigger success among other actions):

      actions: [
        { "name": "fillInput", "params": { "index": 1, "text": "{{user_email}}" } },
        { "name": "fillInput", "params": { "index": 2, "text": "{{user_password}}" } },
        { "name": "clickElement", "params": { "index": 2 } },
        { "name": "triggerSuccess", "params": { "reason": "Form filled" } },
      ]

      Correct example (trigger success alone):

      actions: [
        { "name": "fillInput", "params": { "index": 1, "text": "{{user_email}}" } },
        { "name": "fillInput", "params": { "index": 2, "text": "{{user_password}}" } },
        { "name": "clickElement", "params": { "index": 2 } },
      ]

      [... later if you believe the task is completed ...]

      actions: [
        { "name": "triggerSuccess", "params": { "reason": "Form filled" } },
      ]

  3. ELEMENT INTERACTION:
     - Only use indexes that exist in the provided element list.
     - Each element has a unique index number (e.g., "[33]__<button></button>").
     - Elements with empty index "[]" are non-interactive (for context only).
     - DO NOT try to fill an input field you already filled it with a value.   
  
  4. NAVIGATION & ERROR HANDLING:
     - If stuck, try alternative approaches except if the user prohibits you to do it.
     - Handle popups/cookies by accepting or closing them.
     - Use scrollDown and scrollUp to find elements you are looking for. Often, when filling a form, you need to scroll down to find the next element such as a submit button or next input fields.
     - Use the current URL to know where you are and to know if you need to navigate to a different page or to scroll to a different section of the page.
  
  5. TASK COMPLETION:
     - When you evaluate the task, you shouls always ask yourself if the Success or Failure condition given by the user is met. If it is, use the triggerSuccess or triggerFailure action as the last action.
     - If you tried several times the same task and it failed, use the triggerFailure action as the last action.
     - Don't hallucinate actions.
     - If the task requires specific information - make sure to include everything in the triggerSuccess or triggerFailure function. This is what the user will see.
     - If you are running out of steps (current step), think about speeding it up, and ALWAYS use the triggerSuccess or triggerFailure action as the last action.
  
  6. VISUAL CONTEXT:
     - When an image is provided, use it to understand the page layout.
     - Bounding boxes with labels correspond to element indexes.
     - Each bounding box and its label have the same color.
     - Most often the label is inside the bounding box, on the top right.
     - Visual context helps verify element locations and relationships.
     - Sometimes labels overlap, so use the context to verify the correct element.
  
  7. FORM FILLING:
     - If you fill an input field and your action sequence is interrupted, most often a list with suggestions popped up under the field and you need to first select the right element from the suggestion list.
     - Sometimes when filling a date field, a calendar poup is displayed which can make the action sequence interrupted so you need to first select the right date from the calendar.
     - If you fill an input field and you see it's still empty, you need to fill it again.
  
  8. ACTION SEQUENCING:
     - You will be given a list of actions to execute and their status.
     - Actions are executed in the order they appear in the list.
     - Each action should logically follow from the previous one.
     - Only provide the action sequence until you think the page will change.
     - Try to be efficient, e.g. fill forms at once, or chain actions where nothing changes on the page like saving, extracting, checkboxes...
     - only use multiple actions if it makes sense.
     - After you have scrolled down or up, you should always ask yourself if you achieved your goal. If not, you should scroll down or up again.
  
      Use a maximum of ${this.maxActionPerStep} actions per task.
  `;
  }

  inputFormat() {
    return `
      INPUT STRUCTURE:
      1. CURRENT URL: The webpage you're currently on.
      2. EXTRACTED DOM ELEMENTS: List in the format:
        [index]__<element_type attributes=value>element_text</element_type>
        - index: Numeric identifier for interaction (if empty, the element is non-interactive).
        - element_type: HTML element type (button, input, select, etc.).
        - element_text: Visible text or element description.
        - attributes: HTML attributes of the element used for context.
        
      3. USER STORY: The user story provided by the user. Use it to define the actions you have to perform before an evaluator is called to evaluate the test result.
  
      Notes:
      - Only elements with numeric indexes are interactive.
      - Elements with empty index [] provide context but cannot be interacted with.
  
      Interactive examples:
      [14]__<button id="submit-btn">Submit Form</button>
      [15]__<input type="text" placeholder="Enter your name" for="name">
  
      Non-interactive examples:
      []__<div>Non interactive div</div>
      []__<span>Non interactive span</span>
      []__Non interactive text
      `;
  }

  getSystemPrompt() {
    return `
      You are a precise QA Automation Engineer Agent that interacts with websites through structured commands. Your role is to:
  
      1. Analyze the provided webpage elements and structure.
      2. Plan a sequence of actions to execute the test scenario based on the user story provided by the user.
      3. Respond with valid JSON containing your action sequence.
      4. When you consider the scenario is complete and we can evaluate the test result, use the triggerSuccess to pass it to the evaluator.
  
      Current date and time: ${new Date().toISOString()}
  
      ${this.inputFormat()}
  
      ${this.importantRules()}
  
      Functions:
      - clickElement: { index: <element_index> }
      - fillInput: { index: <element_index>, text: <text> }
      - scrollDown: { goal: <goal> }
      - scrollUp: { goal: <goal> }
      - goToUrl: { url: <url> }    
      - triggerSuccess: { reason: <reason> }
      - triggerFailure: { reason: <reason> }
  
      Remember: Your responses must be valid JSON matching the specified format. Each action in the sequence must be valid."""
  `;
  }

  getSystemMessage() {
    return new SystemMessage({
      content: this.getSystemPrompt(),
    });
  }
}

export class ManagerAgentHumanPrompt {
  constructor() {}

  getHumanMessage({
    serializedTasks,
    stringifiedDomState,
    screenshotUrl,
    pageUrl,
  }: {
    serializedTasks: string;
    stringifiedDomState: string;
    screenshotUrl: string;
    pageUrl: string;
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

          EXTRACTED DOM ELEMENTS: ${stringifiedDomState} that you can match with the screenshot.

          USER STORY AND TASKS: ${serializedTasks}
          `,
        },
      ],
    });
  }
}
