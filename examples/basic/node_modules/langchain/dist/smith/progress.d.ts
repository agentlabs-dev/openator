export declare class ProgressBar {
    total: number;
    current: number;
    barLength: number;
    format: string;
    constructor(props: {
        total: number;
        format?: string;
        barLength?: number;
    });
    initialize(): void;
    update({ current, formatArgs, }: {
        current: number;
        formatArgs?: Record<string, string>;
    }): void;
    increment({ formatArgs, }?: {
        formatArgs?: Record<string, string>;
    }): void;
    complete({ formatArgs }?: {
        formatArgs?: Record<string, string>;
    }): void;
}
