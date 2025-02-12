import { IsString } from 'class-validator';

export class RunTestDto {
  @IsString()
  userStory: string;

  @IsString()
  startUrl: string;
}
