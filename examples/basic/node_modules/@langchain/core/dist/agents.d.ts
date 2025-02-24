export type AgentAction = {
    tool: string;
    toolInput: string | Record<string, any>;
    log: string;
};
export type AgentFinish = {
    returnValues: Record<string, any>;
    log: string;
};
export type AgentStep = {
    action: AgentAction;
    observation: string;
};
