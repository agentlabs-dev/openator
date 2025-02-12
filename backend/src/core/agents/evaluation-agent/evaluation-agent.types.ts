import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const EvaluationAgentResponseSchema = z
  .object({
    status: z
      .enum(["passed", "failed"])
      .describe("Whether you think the test has passed or failed."),
    reason: z.string().describe("The reason for the success or failure."),
  })
  .describe(
    'The result of your evaluation e.g. { status: "passed", reason: "The test has passed." }',
  );

export type EvaluationAgentResponse = z.infer<
  typeof EvaluationAgentResponseSchema
>;

export const JsonifiedEvaluationAgentResponseSchema = JSON.stringify(
  zodToJsonSchema(EvaluationAgentResponseSchema, "ExpectedResponseFormat"),
);

export const EvaluationAgentResponseExamples = `
Example Response 1:
{
  "status": "passed",
  "reason": "The test has passed."
}

Example Response 2:
{
  "status": "failed",
  "reason": "The user story wanted to see dog results, but displayed car results instead."
}

Example Response 3:
{
  "status": "failed",
  "reason": "The user story wanted to display a success message, but displayed an error message instead."
}
`;
