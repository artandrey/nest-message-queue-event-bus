import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EventDrivenModule } from 'src/lib/nest-event-driven/event-driven.module';

import { AppConfigModel } from './application/models/app-config.model';
import { BaseToken } from './constants';
import { BullMqPublisher } from './infrastructure/messaging/bullmq-publisher';
import { BullMqSubscriber } from './infrastructure/messaging/bullmq-subscriber';
import { validateConfig } from './infrastructure/util/validate-config';

@Global()
@Module({
  imports: [
    EventDrivenModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => validateConfig(config, AppConfigModel),
      ignoreEnvFile: false,
      envFilePath: ['./config/.env', './config/.env.local'],
    }),
  ],
  providers: [{ provide: BaseToken.APP_CONFIG, useClass: ConfigService }, BullMqPublisher, BullMqSubscriber],
  exports: [BaseToken.APP_CONFIG, BaseToken.EVENT_DISPATCHER],
})
export class SharedModule {}
