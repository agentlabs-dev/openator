import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsModule } from './jobs/jobs.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [JobsModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
