import 'reflect-metadata';

import { IEventHandlerOptions } from '../interfaces/event-handler.interface';
import { IEvent } from '../interfaces/event.interface';
import { EVENTS_HANDLER_METADATA, SCOPE_OPTIONS_METADATA } from './constants';

export function EventHandler(options: IEventHandlerOptions): ClassDecorator;

export function EventHandler(...events: (IEvent | (new (...args: any[]) => IEvent))[]): ClassDecorator;

export function EventHandler(...eventsOrOptions: any[]): ClassDecorator {
  return (target: object) => {
    if (!eventsOrOptions?.[0].prototype && eventsOrOptions?.[0]?.events) {
      const options: IEventHandlerOptions = eventsOrOptions.shift();
      Reflect.defineMetadata(EVENTS_HANDLER_METADATA, options.events, target);
      Reflect.defineMetadata(SCOPE_OPTIONS_METADATA, { scope: options.scope }, target);
    } else {
      const events: IEvent[] = eventsOrOptions;
      Reflect.defineMetadata(EVENTS_HANDLER_METADATA, events, target);
    }
  };
}
