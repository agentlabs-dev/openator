import { Controller, Post, Body } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { RunTestDto } from './dtos/run.test.dto';
import { socketEventBus } from '../events/event-bus';
import { RunJobUsecase } from '@/app/usecases/run-job';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('start')
  async runTest(@Body() body: RunTestDto) {
    const runJobUsecase = new RunJobUsecase();

    /**
     * This is a POC, we'll improve that later.
     */
    const { jobId, sessionId, liveUrl } = await runJobUsecase.execute(
      body.startUrl,
      body.userStory,
      socketEventBus,
    );

    return {
      password: 'secret',
      jobId,
      sessionId,
      liveUrl,
    };
  }
}
