"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootListenersTracer = void 0;
const base_js_1 = require("./base.cjs");
class RootListenersTracer extends base_js_1.BaseTracer {
    constructor({ config, onStart, onEnd, onError, }) {
        super({ _awaitHandler: true });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "RootListenersTracer"
        });
        /** The Run's ID. Type UUID */
        Object.defineProperty(this, "rootId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "argOnStart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "argOnEnd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "argOnError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.config = config;
        this.argOnStart = onStart;
        this.argOnEnd = onEnd;
        this.argOnError = onError;
    }
    /**
     * This is a legacy method only called once for an entire run tree
     * therefore not useful here
     * @param {Run} _ Not used
     */
    persistRun(_) {
        return Promise.resolve();
    }
    async onRunCreate(run) {
        if (this.rootId) {
            return;
        }
        this.rootId = run.id;
        if (this.argOnStart) {
            await this.argOnStart(run, this.config);
        }
    }
    async onRunUpdate(run) {
        if (run.id !== this.rootId) {
            return;
        }
        if (!run.error) {
            if (this.argOnEnd) {
                await this.argOnEnd(run, this.config);
            }
        }
        else if (this.argOnError) {
            await this.argOnError(run, this.config);
        }
    }
}
exports.RootListenersTracer = RootListenersTracer;
