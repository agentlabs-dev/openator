import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const ManagerAgentActionSchema = z
  .union([
    z.object({
      name: z.literal('clickElement'),
      params: z.object({
        index: z.number(),
      }),
      description: z
        .string()
        .describe(
          "A short description of the action you want to perform. E.g 'Click the login button'",
        ),
    }),
    z.object({
      name: z.literal('fillInput'),
      params: z.object({
        index: z.number(),
        text: z.string(),
      }),
      description: z
        .string()
        .describe(
          "A short description of the action you want to perform. E.g 'Fill the email input'",
        ),
    }),
    z.object({
      name: z.literal('scrollDown'),
      description: z
        .string()
        .describe(
          "A short description of the action you want to perform. E.g 'Scroll down to find the login form'",
        ),
      params: z.null(),
    }),
    z.object({
      name: z.literal('scrollUp'),
      description: z
        .string()
        .describe(
          "A short description of the action you want to perform. E.g 'Scroll up to find the login form'",
        ),
      params: z.null(),
    }),
    z.object({
      name: z.literal('goToUrl'),
      params: z.object({
        url: z.string(),
      }),
      description: z
        .string()
        .describe(
          "A short description of the action you want to perform. E.g 'Go to the login page'",
        ),
    }),
    z.object({
      name: z.literal('takeScreenshot'),
      description: z
        .string()
        .describe(
          "A short description of the action you want to perform. E.g 'Take a screenshot of the current page'",
        ),
      params: z.null(),
    }),
    z
      .object({
        name: z.literal('triggerSuccess'),
        params: z.object({
          reason: z.string(),
        }),
        description: z.null(),
      })
      .describe(
        'Trigger success means you have completed the user story and we can ask the evaluator to evaluate the test result.',
      ),
    z
      .object({
        name: z.literal('triggerFailure'),
        params: z.object({
          reason: z.string(),
        }),
        description: z.null(),
      })
      .describe(
        "Trigger failure means you have failed to complete the user story and you don't know how to complete the scenario. You may be stuck somewhere, explain it.",
      ),
  ])
  .describe(
    'The action to be executed. e.g. { name: "clickElement", params: { index: 2 }, description: "Click the login button" }',
  );

export type ManagerAgentAction = z.infer<typeof ManagerAgentActionSchema>;

export const ManagerAgentResponseSchema = z.object({
  currentState: z.object({
    evaluationPreviousGoal: z.string(),
    memory: z.string(),
    nextGoal: z.string(),
  }),
  actions: z.array(ManagerAgentActionSchema),
});

export type ManagerResponse = z.infer<typeof ManagerAgentResponseSchema>;

export const JsonifiedManagerResponseSchema = JSON.stringify(
  zodToJsonSchema(ManagerAgentResponseSchema, 'ExpectedResponseFormat'),
);

export const ManagerResponseExamples = `

Example Response 1:
{
  "currentState": {
    "evaluationPreviousGoal": "Cookies have been accepted. We can now proceed to login.",
    "memory": "Cookies accepted, ready to login. End goal is to login to my account.",
    "nextGoal": "Display the login form.",
  },
  "actions": [{"name": "clickElement", "params": {"index": 3}, "description": "Click the login button"}]
}

Example Response 2:
{
  "currentState": {
    "evaluationPreviousGoal": "An element seems to prevent us from logging in. We need close the cookies popup.",
    "memory": "Our end goal is to login to my account. We need to close the cookies popup and then we can proceed to login.",
    "nextGoal": "Close cookies popup and then login.",
  },
  "actions": [{"name": "clickElement", "params": {"index": 5}, "description": "Close the cookies popup"}]
}

Example Response 3:
{
  "currentState": {
    "evaluationPreviousGoal": "We need to scroll down to find the login form.",
    "memory": "We need to scroll down to find the login form. End goal is to login to my account.",
    "nextGoal": "Scroll down to find the login form."
  },
   "actions": [{"name": "scrollDown", "description": "Scroll down to find the login form"}]
}
`;
