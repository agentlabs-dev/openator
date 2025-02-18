import { Job } from '@/core/entities/job';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JobsService {
  private jobs: Job[] = [];
  constructor() {}

  async saveJob(job: Job) {
    this.jobs.push(job);
  }

  async findById(jobId: string) {
    return this.jobs.find((job) => job.id === jobId);
  }

  async findBySessionId(sessionId: string) {
    return this.jobs.find((job) => job.sessionId === sessionId);
  }
}
