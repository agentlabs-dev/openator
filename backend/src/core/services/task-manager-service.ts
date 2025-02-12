import { Task } from "@/core/entities/task";

export class TaskManagerService {
  private tasks: Task[] = [];
  private endGoal: string | null = null;

  constructor() {}

  setEndGoal(endGoal: string) {
    this.endGoal = endGoal;
  }

  getEndGoal() {
    return this.endGoal!;
  }

  add(task: Task) {
    this.tasks.push(task);
  }

  update(task: Task) {
    this.tasks = this.tasks.map((t) => (t.id === task.id ? task : t));
  }

  getLatestTask() {
    return this.tasks[this.tasks.length - 1] ?? null;
  }

  getSerializedTasks() {
    return JSON.stringify({
      endGoal: this.endGoal,
      latestTaskCompleted: this.getLatestTask()?.asObject(),
    });
  }
}
