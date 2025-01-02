import { Scope } from '@nestjs/common';
import 'reflect-metadata';

import { EventHandlerProviderOptions, EventOption } from '../interfaces/event-handler.interface';
import { EVENTS_HANDLER_METADATA, SCOPE_OPTIONS_METADATA } from './constants';

export function EventHandler(
  events: EventOption | EventOption[],
  options: EventHandlerProviderOptions = { scope: Scope.DEFAULT },
): ClassDecorator {
  return (target: object) => {
    if (Array.isArray(events)) {
      Reflect.defineMetadata(EVENTS_HANDLER_METADATA, events, target);
    } else {
      Reflect.defineMetadata(EVENTS_HANDLER_METADATA, [events], target);
    }
    Reflect.defineMetadata(SCOPE_OPTIONS_METADATA, { scope: options.scope }, target);
  };
}
