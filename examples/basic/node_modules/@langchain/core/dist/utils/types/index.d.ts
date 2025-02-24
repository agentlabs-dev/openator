export * from "./is_zod_schema.js";
/**
 * Represents a string value with autocompleted, but not required, suggestions.
 */
export type StringWithAutocomplete<T> = T | (string & Record<never, never>);
export type InputValues<K extends string = string> = Record<K, any>;
export type PartialValues<K extends string = string> = Record<K, string | (() => Promise<string>) | (() => string)>;
export type ChainValues = Record<string, any>;
