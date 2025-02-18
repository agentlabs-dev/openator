import { Run } from '@/core/entities/run';

export class RunRepository {
  private runs: Run[] = [];

  constructor() {
    this.runs = [];
  }

  async create(run: Run) {
    this.runs.push(run);
    return run;
  }

  async findById(id: string) {
    return this.runs.find((run) => run.id === id);
  }

  async findAll() {
    return this.runs;
  }

  async update(run: Run) {
    const index = this.runs.findIndex((r) => r.id === run.id);
    if (index !== -1) {
      this.runs[index] = run;
    }
  }

  async delete(id: string) {
    this.runs = this.runs.filter((run) => run.id !== id);
  }
}
