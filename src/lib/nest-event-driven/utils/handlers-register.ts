import { Type } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';

import { EventOption } from '../interfaces/event-handler.interface';

export class HandlerRegister<T, TypeT extends Type<T> = Type<T>> {
  private handlers = new Map<string, Set<T>>();
  private scopedHandlers = new Map<string, Set<TypeT>>();
  private queueNames = new Set<string>();

  constructor(
    private moduleRef: ModuleRef,
    private metadataKey: any,
  ) {}

  registerHandler(handler: TypeT): boolean {
    const eventOptions = this.reflectEventOptions(handler);
    if (!eventOptions) {
      return false;
    }

    try {
      const instance = this.moduleRef.get(handler, { strict: false });
      if (instance) {
        if (Array.isArray(eventOptions)) {
          for (const singleTarget of eventOptions) {
            this.registerQueueName(singleTarget);
            const handlerKey = this.buildHandlerKey(singleTarget);
            const set = this.handlers.get(handlerKey) ?? new Set();
            this.handlers.set(handlerKey, set.add(instance));
          }
        } else {
          this.registerQueueName(eventOptions);
          const handlerKey = this.buildHandlerKey(eventOptions);
          const set = this.handlers.get(handlerKey) ?? new Set();
          this.handlers.set(handlerKey, set.add(instance));
        }
      }
    } catch {
      try {
        this.moduleRef.introspect(handler);
        if (Array.isArray(eventOptions)) {
          for (const singleTarget of eventOptions) {
            this.registerQueueName(singleTarget);
            const handlerKey = this.buildHandlerKey(singleTarget);
            const set = this.scopedHandlers.get(handlerKey) ?? new Set();
            this.scopedHandlers.set(handlerKey, set.add(handler));
          }
        } else {
          this.registerQueueName(eventOptions);
          const handlerKey = this.buildHandlerKey(eventOptions);
          const set = this.scopedHandlers.get(handlerKey) ?? new Set();
          this.scopedHandlers.set(handlerKey, set.add(handler));
        }
      } catch {
        return false;
      }
    }

    return true;
  }

  private buildHandlerKey(eventName: string, queueName?: string): string;
  private buildHandlerKey(event: EventOption): string;
  private buildHandlerKey(eventOrName: EventOption | string, queueName?: string): string {
    if (typeof eventOrName === 'string') {
      return queueName ? `${eventOrName}-${queueName}` : eventOrName;
    }
    if (typeof eventOrName === 'function') {
      return eventOrName.name;
    }
    return eventOrName.queueName ? `${eventOrName.event.name}-${eventOrName.queueName}` : eventOrName.event.name;
  }

  private registerQueueName(eventOptions: EventOption) {
    if (typeof eventOptions === 'function') {
      return;
    }
    if (eventOptions.queueName) {
      this.queueNames.add(eventOptions.queueName);
    }
  }

  private reflectEventOptions(handler: TypeT): EventOption {
    return Reflect.getMetadata(this.metadataKey, handler);
  }

  async get<E>(event: E, queueName?: string): Promise<T[] | undefined> {
    const eventName = this.getName(event);
    const handlerKey = this.buildHandlerKey(eventName, queueName);
    const singletonHandlers = [...(this.handlers.get(handlerKey) ?? [])];

    const contextId = ContextIdFactory.create();
    const handlerTypes = this.scopedHandlers.get(handlerKey);
    if (!handlerTypes) return singletonHandlers;
    const scopedHandlers = await Promise.all(
      [...handlerTypes.values()].map((handlerType) =>
        this.moduleRef.resolve(handlerType, contextId, {
          strict: false,
        }),
      ),
    );

    return [...singletonHandlers, ...scopedHandlers];
  }

  getName<E>(event: E): string {
    const { constructor } = Object.getPrototypeOf(event);
    return constructor.name as string;
  }

  getQueueNames(): string[] {
    return [...this.queueNames];
  }
}
