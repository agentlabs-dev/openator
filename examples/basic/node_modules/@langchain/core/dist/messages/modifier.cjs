"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveMessage = void 0;
const base_js_1 = require("./base.cjs");
/**
 * Message responsible for deleting other messages.
 */
class RemoveMessage extends base_js_1.BaseMessage {
    constructor(fields) {
        super({
            ...fields,
            content: "",
        });
        /**
         * The ID of the message to remove.
         */
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.id = fields.id;
    }
    _getType() {
        return "remove";
    }
    get _printableFields() {
        return {
            ...super._printableFields,
            id: this.id,
        };
    }
}
exports.RemoveMessage = RemoveMessage;
