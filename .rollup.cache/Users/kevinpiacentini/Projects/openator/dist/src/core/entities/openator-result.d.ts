export declare const OpenatorResultStatuses: readonly ["success", "failed"];
export type OpenatorResultStatus = (typeof OpenatorResultStatuses)[number];
export type OpenatorResult = {
    status: OpenatorResultStatus;
    reason: string;
    result: string;
    stepCount: number;
};
