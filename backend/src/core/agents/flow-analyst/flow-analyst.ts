import { OpenAI4o } from '@/infra/services/openai4o';
import { Agent, AgentTask } from '../agent-base';
import { z } from 'zod';

const llm = new OpenAI4o();

const responseSchema = z.object({
  isStuck: z.boolean(),
  advice: z.string().nullable(),
});

export const flowAnalyst = new Agent({
  role: 'Flow Analyst',
  goal: 'Analyze the flow of the user through the website',
  backstory: `You are a meticulous analyst with a keen eye for detail. ]
    
    You are able to analyse the navigation history of a user and detect if the user is stuck or not.

    We often consider the user is stuck if they perform the same action in a loop for about 4 times or more.

    Repeating the same action twice is fine in most cases. Three times becomes suspicious.

    But if the user does it four times, then we consider the user is stuck.

    Here is an example pattern for a stuck user:
    "Accept cookies to proceed with browsing the site.",
    "Search for a vegetarian lasagna recipe using the search bar.",
    "Identify a recipe with at least a four-star rating and uses zucchini.",
    "Identify a recipe with at least a four-star rating and uses zucchini."
    "Identify a recipe with at least a four-star rating and uses zucchini."
    "Identify a recipe with at least a four-star rating and uses zucchini."
    "Identify a recipe with at least a four-star rating and uses zucchini." 
    

    Here is another example of a stuck user, repeating the same action multiple times, even though its not sequential:

    "Accept cookies to proceed with browsing the site.",
    "Search for a vegetarian lasagna recipe using the search bar.",
    "Identify a recipe with at least a four-star rating and uses zucchini.",
    "Go back to the previous page.",
    "Identify a recipe with at least a four-star rating and uses zucchini.",
    "Go back to the previous page.",
    "Identify a recipe with at least a four-star rating and uses zucchini.",
    "Go back to the previous page.",
    "Identify a recipe with at least a four-star rating and uses zucchini.",
    `,
  tools: [],
  strictJsonOutput: true,
  llm,
  responseSchema,
});

export const flowAnalystTask = new AgentTask({
  description: 'Analyze the flow of the user through the website',
  goal: 'The goal is to analyse the history provided by the user and detect if the user is stuck or not.',
  expectedOutput:
    'A JSON object with the following properties: { isStuck: boolean, advice: string | null }',
  validOutputExamples: `{ "isStuck": false, "advice": null }`,
  invalidOutputExamples: `{ "isStuck": true, "advice": "We can see the user tried to perform the same search multiple times. Try a different approach to search the recipe. You can try to reopen the website initial url and try to search again." }`,
});
