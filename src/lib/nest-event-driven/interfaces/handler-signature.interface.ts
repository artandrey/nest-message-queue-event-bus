import { EventSignature } from './event-handler.interface';

export interface EventHandlerSignature {
  event: EventSignature;
  queueName?: string;
}
