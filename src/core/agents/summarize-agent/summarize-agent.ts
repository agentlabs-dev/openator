import { Agent, AgentTask } from '../agent-base';
import { z } from 'zod';
import { LLM } from '@/core/interfaces/llm.interface';

const responseSchema = z.object({
  takeaways: z.string(),
});

export type SummarizeAgent = Agent<z.infer<typeof responseSchema>>;

export const initSummarizer = (llm: LLM) =>
  new Agent({
    role: 'Summarizer',
    goal: 'Summarize the content provided by the user with key takeaways',
    backstory: `You are a meticulous analyst with a keen eye for detail.

  You are able to summarize the content provided by the user with key takeaways.

  Depending on the context, you will deduce that details are not relevant to the users.

  These details will depends on the context of the user.

  For example, in a recipe website, the list of ingredients, calories, etc. are relevant to the user. Where as in a news website, the list of ingredients, calories, etc. are not relevant to the user.
    `,
    tools: [],
    strictJsonOutput: true,
    llm,
    responseSchema,
  });

export const initSummarizeTask = () =>
  new AgentTask({
    description:
      'Summarize the key takeaways from the content provided by the user. Try to use the least amount of words possible without losing the context. Be as specific as possible.',
    goal: 'The goal is to summarize the content provided by the user with key takeaways.',
    expectedOutput:
      'A JSON object with the following properties: { takeaways: string[] }',
    validOutputExamples: `{ "takeaways": "The recipie named Vegetarian Lasagna is available at https://www.example.com/recipes/vegetarian-lasagna", has a rating of 4.4, contains zuchini, tomatoes, cucumber, and under 500 calories per serving. }`,
    invalidOutputExamples: `{ "takeaways": "The recipie named Vegetarian Lasagna is good" }`,
  });
