export class TaskManagerService {
    constructor() {
        this.tasks = [];
        this.endGoal = null;
    }
    setEndGoal(endGoal) {
        this.endGoal = endGoal;
    }
    getEndGoal() {
        return this.endGoal;
    }
    add(task) {
        this.tasks.push(task);
    }
    update(task) {
        this.tasks = this.tasks.map((t) => (t.id === task.id ? task : t));
    }
    getLatestTaskPerformed() {
        return (this.tasks.filter((t) => t.status !== 'running')[this.tasks.length - 1] ??
            null);
    }
    getTaskHistorySummary() {
        return this.tasks.map((t) => t.goal);
    }
    getSerializedTasks() {
        const serialized = JSON.stringify({
            endGoal: this.endGoal,
            taskHistorySummary: this.getTaskHistorySummary(),
            previousTaskResult: this.getLatestTaskPerformed()?.objectForLLM(),
        }, null, 2);
        console.log('serialized', serialized);
        return serialized;
    }
}
//# sourceMappingURL=task-manager-service.js.map