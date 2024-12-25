import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Worker } from 'bullmq';
import IORedis from 'ioredis';

import { EventBus } from '~lib/nest-event-driven/event-bus';

@Injectable()
export class BullMqSubscriber {
  private readonly connection: IORedis;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventBus: EventBus,
  ) {
    this.connection = new IORedis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
    });
  }

  onApplicationBootstrap() {
    const handlerSignatures = this.eventBus.getHandlerSignatures();
    for (const handlerSignature of handlerSignatures) {
      if (!handlerSignature.queueName) {
        continue;
      }
      new Worker(
        handlerSignature.queueName,
        async (job: Job) => {
          const event = new handlerSignature.event(job.data);
          await this.eventBus.consumeByStrictlySingleHandler(event, handlerSignature.queueName);
        },
        { connection: this.connection },
      );
    }
  }
}
