import { Inject, OnApplicationBootstrap } from '@nestjs/common';
import { Connection } from 'amqplib';
import { plainToInstance } from 'class-transformer';

import { EventBus } from '~lib/nest-event-driven';
import { RABBITMQ_CONNECTION } from '~lib/nest-rabbitmq/constants';

export class RabbitMqSubscriber implements OnApplicationBootstrap {
  constructor(
    @Inject(RABBITMQ_CONNECTION) private readonly connection: Connection,
    private readonly eventBus: EventBus,
  ) {}

  async onApplicationBootstrap() {
    const channel = await this.connection.createChannel();
    const handlerSignatures = this.eventBus.getHandlerSignatures();

    for (const handlerSignature of handlerSignatures) {
      if (!handlerSignature.queueName) {
        continue;
      }
      await channel.assertQueue(handlerSignature.queueName);
      channel.consume(handlerSignature.queueName, async (message) => {
        if (!message) return;
        const event = plainToInstance(handlerSignature.event, JSON.parse(message.content.toString()));
        await this.eventBus.consumeByStrictlySingleHandler(event, handlerSignature.queueName);
        channel.ack(message);
      });
    }
  }
}
