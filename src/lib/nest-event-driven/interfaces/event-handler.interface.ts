import { Scope } from '@nestjs/common';

import { IEvent } from './event.interface';

export type EventSignature = new (...args: any[]) => IEvent;
export type EventOption =
  | EventSignature
  | {
      event: EventSignature;
      queueName?: string;
    };

export interface IEventHandlerOptions {
  events: EventOption[];
  scope?: Scope;
}

export interface IEventHandler<TEvent extends IEvent> {
  handle(event: TEvent): void;
}
