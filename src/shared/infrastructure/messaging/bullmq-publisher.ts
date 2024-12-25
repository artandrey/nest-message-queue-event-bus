import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

import { IEvent, IEventPublisher } from '~lib/nest-event-driven';

@Injectable()
export class BullMqPublisher implements IEventPublisher {
  private readonly connection: IORedis;

  private readonly queuesPool: Map<string, Queue> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.connection = new IORedis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
    });
  }

  publish<E extends IEvent<object, any>>(event: E): void {
    const queue = this.queuesPool.get(event.eventType) || new Queue(event.eventType, { connection: this.connection });
    queue.add(event.eventType, event);
  }

  publishAll<E extends IEvent<object, any>>(events: E[]): void {
    for (const event of events) {
      this.publish(event);
    }
  }
}
