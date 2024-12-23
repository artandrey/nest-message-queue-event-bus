import { Subject } from 'rxjs';

import { IEvent } from 'src/lib/nest-event-driven';

export interface IMessageSubscriber<TEvent extends IEvent = IEvent> {
  /**
   * Bridges events to a message bus subject, allowing events to flow through without
   * direct control over the event handling process by the message source.
   * @param subject The RxJS Subject that will act as the message bus
   */
  bridgeEventsTo(subject: Subject<TEvent>): void;
}
