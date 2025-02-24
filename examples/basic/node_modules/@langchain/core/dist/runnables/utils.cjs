"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._RootEventFilter = exports.isRunnableInterface = void 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRunnableInterface(thing) {
    return thing ? thing.lc_runnable : false;
}
exports.isRunnableInterface = isRunnableInterface;
/**
 * Utility to filter the root event in the streamEvents implementation.
 * This is simply binding the arguments to the namespace to make save on
 * a bit of typing in the streamEvents implementation.
 *
 * TODO: Refactor and remove.
 */
class _RootEventFilter {
    constructor(fields) {
        Object.defineProperty(this, "includeNames", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "includeTypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "includeTags", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "excludeNames", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "excludeTypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "excludeTags", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.includeNames = fields.includeNames;
        this.includeTypes = fields.includeTypes;
        this.includeTags = fields.includeTags;
        this.excludeNames = fields.excludeNames;
        this.excludeTypes = fields.excludeTypes;
        this.excludeTags = fields.excludeTags;
    }
    includeEvent(event, rootType) {
        let include = this.includeNames === undefined &&
            this.includeTypes === undefined &&
            this.includeTags === undefined;
        const eventTags = event.tags ?? [];
        if (this.includeNames !== undefined) {
            include = include || this.includeNames.includes(event.name);
        }
        if (this.includeTypes !== undefined) {
            include = include || this.includeTypes.includes(rootType);
        }
        if (this.includeTags !== undefined) {
            include =
                include || eventTags.some((tag) => this.includeTags?.includes(tag));
        }
        if (this.excludeNames !== undefined) {
            include = include && !this.excludeNames.includes(event.name);
        }
        if (this.excludeTypes !== undefined) {
            include = include && !this.excludeTypes.includes(rootType);
        }
        if (this.excludeTags !== undefined) {
            include =
                include && eventTags.every((tag) => !this.excludeTags?.includes(tag));
        }
        return include;
    }
}
exports._RootEventFilter = _RootEventFilter;
