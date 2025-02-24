import { Task } from '@/core/entities/task';
export declare class TaskManagerService {
    private tasks;
    private endGoal;
    constructor();
    setEndGoal(endGoal: string): void;
    getEndGoal(): string;
    add(task: Task): void;
    update(task: Task): void;
    getLatestTaskPerformed(): Task;
    getTaskHistorySummary(): string[];
    getSerializedTasks(): string;
}
