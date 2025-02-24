"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBaseCallbackHandler = exports.BaseCallbackHandler = exports.callbackHandlerPrefersStreaming = void 0;
const uuid = __importStar(require("uuid"));
const serializable_js_1 = require("../load/serializable.cjs");
const env_js_1 = require("../utils/env.cjs");
/**
 * Abstract class that provides a set of optional methods that can be
 * overridden in derived classes to handle various events during the
 * execution of a LangChain application.
 */
class BaseCallbackHandlerMethodsClass {
}
function callbackHandlerPrefersStreaming(x) {
    return "lc_prefer_streaming" in x && x.lc_prefer_streaming;
}
exports.callbackHandlerPrefersStreaming = callbackHandlerPrefersStreaming;
/**
 * Abstract base class for creating callback handlers in the LangChain
 * framework. It provides a set of optional methods that can be overridden
 * in derived classes to handle various events during the execution of a
 * LangChain application.
 */
class BaseCallbackHandler extends BaseCallbackHandlerMethodsClass {
    get lc_namespace() {
        return ["langchain_core", "callbacks", this.name];
    }
    get lc_secrets() {
        return undefined;
    }
    get lc_attributes() {
        return undefined;
    }
    get lc_aliases() {
        return undefined;
    }
    get lc_serializable_keys() {
        return undefined;
    }
    /**
     * The name of the serializable. Override to provide an alias or
     * to preserve the serialized module name in minified environments.
     *
     * Implemented as a static method to support loading logic.
     */
    static lc_name() {
        return this.name;
    }
    /**
     * The final serialized identifier for the module.
     */
    get lc_id() {
        return [
            ...this.lc_namespace,
            (0, serializable_js_1.get_lc_unique_name)(this.constructor),
        ];
    }
    constructor(input) {
        super();
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "lc_kwargs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ignoreLLM", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "ignoreChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "ignoreAgent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "ignoreRetriever", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "ignoreCustomEvent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "raiseError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "awaitHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (0, env_js_1.getEnvironmentVariable)("LANGCHAIN_CALLBACKS_BACKGROUND") === "false"
        });
        this.lc_kwargs = input || {};
        if (input) {
            this.ignoreLLM = input.ignoreLLM ?? this.ignoreLLM;
            this.ignoreChain = input.ignoreChain ?? this.ignoreChain;
            this.ignoreAgent = input.ignoreAgent ?? this.ignoreAgent;
            this.ignoreRetriever = input.ignoreRetriever ?? this.ignoreRetriever;
            this.ignoreCustomEvent =
                input.ignoreCustomEvent ?? this.ignoreCustomEvent;
            this.raiseError = input.raiseError ?? this.raiseError;
            this.awaitHandlers =
                this.raiseError || (input._awaitHandler ?? this.awaitHandlers);
        }
    }
    copy() {
        return new this.constructor(this);
    }
    toJSON() {
        return serializable_js_1.Serializable.prototype.toJSON.call(this);
    }
    toJSONNotImplemented() {
        return serializable_js_1.Serializable.prototype.toJSONNotImplemented.call(this);
    }
    static fromMethods(methods) {
        class Handler extends BaseCallbackHandler {
            constructor() {
                super();
                Object.defineProperty(this, "name", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: uuid.v4()
                });
                Object.assign(this, methods);
            }
        }
        return new Handler();
    }
}
exports.BaseCallbackHandler = BaseCallbackHandler;
const isBaseCallbackHandler = (x) => {
    const callbackHandler = x;
    return (callbackHandler !== undefined &&
        typeof callbackHandler.copy === "function" &&
        typeof callbackHandler.name === "string" &&
        typeof callbackHandler.awaitHandlers === "boolean");
};
exports.isBaseCallbackHandler = isBaseCallbackHandler;
