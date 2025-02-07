import { Subject } from 'rxjs';

import { IEvent } from './event.interface';

export interface IEventBus<TEvent extends IEvent = IEvent> {
  readonly subject$: Subject<TEvent>;
  publish<T extends TEvent>(event: T): void;
  publishAll(events: TEvent[]): void;
  /**
   * Consumes an event by exactly one handler. If there are multiple or none handlers available
   * for this event type, an error will be thrown. This ensures strict single-handler
   * consumption of events.
   * @param event The event to be consumed
   * @throws Error when more than one handler is found for the event
   * @returns Promise that resolves when the event is handled
   */
  synchronouslyConsumeByStrictlySingleHandler(event: TEvent): Promise<void>;
  /**
   * Consumes an event by multiple handlers. If there are no handlers available for the event type,
   * an error will be thrown.
   * @param event The event to be consumed
   * @throws Error when no handlers are found for the event
   * @returns Promise that resolves when all handlers are executed
   */
  synchronouslyConsumeByMultipleHandlers(event: TEvent): Promise<void>;
}
