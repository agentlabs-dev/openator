import { z } from 'zod';
export declare const EvaluationResponseSchema: z.ZodObject<{
    result: z.ZodUnion<[z.ZodLiteral<"success">, z.ZodLiteral<"failed">, z.ZodLiteral<"unknown">]>;
    explanation: z.ZodString;
}, "strip", z.ZodTypeAny, {
    result: "unknown" | "failed" | "success";
    explanation: string;
}, {
    result: "unknown" | "failed" | "success";
    explanation: string;
}>;
export type EvaluationResponse = z.infer<typeof EvaluationResponseSchema>;
