import { IsString } from 'class-validator';

export class AppConfigModel {
  @IsString()
  TEST!: string;

  @IsString()
  APP_NAME!: string;
}
