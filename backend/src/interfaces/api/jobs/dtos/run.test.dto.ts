import { IsString } from 'class-validator';

export class RunTestDto {
  @IsString()
  scenario: string;

  @IsString()
  startUrl: string;
}
