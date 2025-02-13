import { ensureFile, writeJson, readJson } from 'fs-extra';

export type TaskResult = {
  web_name: string;
  task_id: string;
  task_prompt: string;
  web: string;
  result: string;
  step_count: number;
  start_time: Date;
  end_time: Date;
  duration_seconds: number;
  eval_result: 'success' | 'failed' | 'unknown';
  eval_reason: string;
};

export class PersistResultService {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async storeResult(taskResult: TaskResult): Promise<void> {
    await ensureFile(this.filePath);
    const results = (await readJson(this.filePath).catch(
      () => [],
    )) as TaskResult[];

    results.push(taskResult);

    writeJson(this.filePath, results, { spaces: 2 });
  }
}
