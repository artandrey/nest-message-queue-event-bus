import { Inject, OnModuleInit } from '@nestjs/common';
import { Channel, Connection } from 'amqplib';

import { IEvent, IEventPublisher } from '~lib/nest-event-driven';
import { RABBITMQ_CONNECTION } from '~lib/nest-rabbitmq/constants';

export class RabbitMqPublisher implements IEventPublisher, OnModuleInit {
  private channel: Channel | null = null;

  constructor(@Inject(RABBITMQ_CONNECTION) private readonly connection: Connection) {}

  async onModuleInit() {
    this.channel = await this.connection.createChannel();
  }

  async publish<E extends IEvent<object, any>>(event: E): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    this.channel.sendToQueue(event.eventType, Buffer.from(JSON.stringify(event)));
  }
  async publishAll<E extends IEvent<object, any>>(events: E[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}
