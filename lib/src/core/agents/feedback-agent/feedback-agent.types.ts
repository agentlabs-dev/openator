import { z } from 'zod';

export const EvaluationResponseSchema = z.object({
  result: z
    .union([z.literal('success'), z.literal('failed'), z.literal('unknown')])
    .describe('The result of the evaluation.'),
  explanation: z
    .string()
    .describe('The explanation and criteria of your result.'),
  hint: z.string().describe('A hint to the user to improve the result.'),
  memoryLearning: z
    .string()
    .describe('A memoryLearning to the user to improve the result.'),
});

export type EvaluationResponse = z.infer<typeof EvaluationResponseSchema>;
