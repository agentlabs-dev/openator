import { type z } from "zod";
/**
 * Given either a Zod schema, or plain object, determine if the input is a Zod schema.
 *
 * @param {z.ZodType<RunOutput> | Record<string, any>} input
 * @returns {boolean} Whether or not the provided input is a Zod schema.
 */
export declare function isZodSchema<RunOutput extends Record<string, any> = Record<string, any>>(input: z.ZodType<RunOutput> | Record<string, any>): input is z.ZodType<RunOutput>;
