import { z } from 'zod';

export const EvaluationResponseSchema = z.object({
  result: z
    .union([z.literal('success'), z.literal('failed'), z.literal('unknown')])
    .describe('The result of the evaluation.'),
  explanation: z
    .string()
    .describe('The explanation and criteria of your result.'),
});

export type EvaluationResponse = z.infer<typeof EvaluationResponseSchema>;
