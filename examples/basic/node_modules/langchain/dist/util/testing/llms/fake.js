import { GenerationChunk } from "@langchain/core/outputs";
import { LLM } from "@langchain/core/language_models/llms";
/**
 * A fake LLM that returns a predefined list of responses. It can be used for
 * testing purposes.
 */
export class FakeListLLM extends LLM {
    static lc_name() {
        return "FakeListLLM";
    }
    constructor({ responses, sleep }) {
        super({});
        Object.defineProperty(this, "responses", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "i", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "sleep", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.responses = responses;
        this.sleep = sleep;
    }
    _llmType() {
        return "fake-list";
    }
    async _call(_prompt, _options, _runManager) {
        const response = this._currentResponse();
        this._incrementResponse();
        await this._sleepIfRequested();
        return response;
    }
    _currentResponse() {
        return this.responses[this.i];
    }
    _incrementResponse() {
        if (this.i < this.responses.length - 1) {
            this.i += 1;
        }
        else {
            this.i = 0;
        }
    }
    async *_streamResponseChunks(_input, _options, _runManager) {
        const response = this._currentResponse();
        this._incrementResponse();
        for await (const text of response) {
            await this._sleepIfRequested();
            yield this._createResponseChunk(text);
        }
    }
    async _sleepIfRequested() {
        if (this.sleep !== undefined) {
            await this._sleep();
        }
    }
    async _sleep() {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), this.sleep);
        });
    }
    _createResponseChunk(text) {
        return new GenerationChunk({
            text,
            generationInfo: {},
        });
    }
}
