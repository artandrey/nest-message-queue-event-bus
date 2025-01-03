import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQContainer, StartedRabbitMQContainer } from '@testcontainers/rabbitmq';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EventBus, EventHandler, IEventHandler } from '~lib/nest-event-driven';
import { EventDrivenModule } from '~lib/nest-event-driven/event-driven.module';
import { IEvent } from '~lib/nest-event-driven/interfaces/event.interface';
import { RabbitMqModule } from '~lib/nest-rabbitmq/rabbitmq.module';
import { RabbitMqPublisher } from '~shared/infrastructure/messaging/rabbitmq-publisher';
import { RabbitMqSubscriber } from '~shared/infrastructure/messaging/rabbitmq-subscriber';

describe('Event driven with RabbitMQ', () => {
  let container: StartedRabbitMQContainer;

  beforeEach(async () => {
    container = await new RabbitMQContainer().start();
  });

  it('should execute queue', async () => {
    class TestEvent implements IEvent<object, any> {
      eventType = 'queue';
      payload = {};
    }

    const processedSpy = vi.fn();

    @EventHandler({
      event: TestEvent,
      queueName: 'queue',
    })
    class TestEventHandler implements IEventHandler<TestEvent> {
      handle(event: TestEvent): void {
        processedSpy(event);
      }
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        EventDrivenModule,
        RabbitMqModule.forRoot({
          connection: { hostname: container.getHost(), port: container.getMappedPort(5672) },
        }),
      ],
      providers: [TestEventHandler, RabbitMqPublisher, RabbitMqSubscriber],
    }).compile();

    const eventBus = moduleFixture.get(EventBus);
    eventBus.publisher = moduleFixture.get(RabbitMqPublisher);

    const app = moduleFixture.createNestApplication();
    await app.init();

    eventBus.publish(new TestEvent());
    eventBus.publish(new TestEvent());

    await vi.waitFor(() => expect(processedSpy).toHaveBeenCalledTimes(2));
  });

  afterEach(async () => {
    await container.stop();
  });
});
