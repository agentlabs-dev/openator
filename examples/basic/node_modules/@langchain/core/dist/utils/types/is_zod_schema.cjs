"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isZodSchema = void 0;
/**
 * Given either a Zod schema, or plain object, determine if the input is a Zod schema.
 *
 * @param {z.ZodType<RunOutput> | Record<string, any>} input
 * @returns {boolean} Whether or not the provided input is a Zod schema.
 */
function isZodSchema(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
input) {
    // Check for a characteristic method of Zod schemas
    return typeof input?.parse === "function";
}
exports.isZodSchema = isZodSchema;
