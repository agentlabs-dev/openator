import { StreamEvent } from "../tracers/event_stream.js";
import type { RunnableInterface } from "./types.js";
export declare function isRunnableInterface(thing: any): thing is RunnableInterface;
/**
 * Utility to filter the root event in the streamEvents implementation.
 * This is simply binding the arguments to the namespace to make save on
 * a bit of typing in the streamEvents implementation.
 *
 * TODO: Refactor and remove.
 */
export declare class _RootEventFilter {
    includeNames?: string[];
    includeTypes?: string[];
    includeTags?: string[];
    excludeNames?: string[];
    excludeTypes?: string[];
    excludeTags?: string[];
    constructor(fields: {
        includeNames?: string[];
        includeTypes?: string[];
        includeTags?: string[];
        excludeNames?: string[];
        excludeTypes?: string[];
        excludeTags?: string[];
    });
    includeEvent(event: StreamEvent, rootType: string): boolean;
}
