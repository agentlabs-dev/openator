import { RunnableConfig } from "../runnables/config.js";
import { BaseTracer, Run } from "./base.js";
export declare class RootListenersTracer extends BaseTracer {
    name: string;
    /** The Run's ID. Type UUID */
    rootId?: string;
    config: RunnableConfig;
    argOnStart?: (run: Run, config: RunnableConfig) => void | Promise<void>;
    argOnEnd?: (run: Run, config: RunnableConfig) => void | Promise<void>;
    argOnError?: (run: Run, config: RunnableConfig) => void | Promise<void>;
    constructor({ config, onStart, onEnd, onError, }: {
        config: RunnableConfig;
        onStart?: (run: Run, config: RunnableConfig) => void | Promise<void>;
        onEnd?: (run: Run, config: RunnableConfig) => void | Promise<void>;
        onError?: (run: Run, config: RunnableConfig) => void | Promise<void>;
    });
    /**
     * This is a legacy method only called once for an entire run tree
     * therefore not useful here
     * @param {Run} _ Not used
     */
    persistRun(_: Run): Promise<void>;
    onRunCreate(run: Run): Promise<void>;
    onRunUpdate(run: Run): Promise<void>;
}
