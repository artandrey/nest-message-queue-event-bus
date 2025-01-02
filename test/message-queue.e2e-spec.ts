import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EventBus, EventsHandler, IEventHandler } from '~lib/nest-event-driven';
import { EventDrivenModule } from '~lib/nest-event-driven/event-driven.module';
import { IEvent } from '~lib/nest-event-driven/interfaces/event.interface';
import { BullMqPublisher } from '~shared/infrastructure/messaging/bullmq-publisher';
import { BullMqSubscriber } from '~shared/infrastructure/messaging/bullmq-subscriber';

describe('Event driven with BullMQ', () => {
  let container: StartedRedisContainer;

  beforeEach(async () => {
    container = await new RedisContainer().start();
  });

  it('should execute queue', async () => {
    class TestEvent implements IEvent<object, any> {
      eventType = 'queue';
      payload = {};
    }

    const processedSpy = vi.fn();

    @EventsHandler({
      events: [
        {
          event: TestEvent,
          queueName: 'queue',
        },
      ],
    })
    class TestEventHandler implements IEventHandler<TestEvent> {
      handle(event: TestEvent): void {
        processedSpy(event);
      }
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        EventDrivenModule,
        ConfigModule.forRoot({ load: [() => ({ REDIS_HOST: container.getHost(), REDIS_PORT: container.getPort() })] }),
      ],
      providers: [TestEventHandler, BullMqPublisher, BullMqSubscriber],
    }).compile();

    const eventBus = moduleFixture.get(EventBus);
    eventBus.publisher = moduleFixture.get(BullMqPublisher);

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
