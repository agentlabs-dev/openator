import { Task } from "../entities/task";

export interface Reporter {
  reportProgress(thinkin: boolean, task?: Task): void;
  info(message: string): void;
  success(message: string): void;
  error(message: string): void;
}
