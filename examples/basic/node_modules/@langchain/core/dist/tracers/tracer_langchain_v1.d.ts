import type { ChainValues } from "../utils/types/index.js";
import type { LLMResult } from "../outputs.js";
import { BaseTracer, type RunType, type Run } from "./base.js";
export interface BaseRunV1 {
    uuid: string;
    parent_uuid?: string;
    start_time: number;
    end_time?: number;
    execution_order: number;
    child_execution_order: number;
    serialized: {
        name: string;
    };
    session_id: number;
    error?: string;
    type: RunType;
}
export interface LLMRun extends BaseRunV1 {
    prompts: string[];
    response?: LLMResult;
}
export interface ChainRun extends BaseRunV1 {
    inputs: ChainValues;
    outputs?: ChainValues;
    child_llm_runs: LLMRun[];
    child_chain_runs: ChainRun[];
    child_tool_runs: ToolRun[];
}
export interface ToolRun extends BaseRunV1 {
    tool_input: string;
    output?: string;
    action: string;
    child_llm_runs: LLMRun[];
    child_chain_runs: ChainRun[];
    child_tool_runs: ToolRun[];
}
export interface BaseTracerSession {
    start_time: number;
    name?: string;
}
export type TracerSessionCreate = BaseTracerSession;
export interface TracerSessionV1 extends BaseTracerSession {
    id: number;
}
/** @deprecated Use LangChainTracer instead. */
export declare class LangChainTracerV1 extends BaseTracer {
    name: string;
    protected endpoint: string;
    protected headers: Record<string, string>;
    protected session: TracerSessionV1;
    constructor();
    newSession(sessionName?: string): Promise<TracerSessionV1>;
    loadSession(sessionName: string): Promise<TracerSessionV1>;
    loadDefaultSession(): Promise<TracerSessionV1>;
    protected convertV2RunToRun(run: Run): Promise<LLMRun | ChainRun | ToolRun>;
    protected persistRun(run: Run | LLMRun | ChainRun | ToolRun): Promise<void>;
    protected persistSession(sessionCreate: BaseTracerSession): Promise<TracerSessionV1>;
    protected _handleSessionResponse(endpoint: string): Promise<TracerSessionV1>;
}
