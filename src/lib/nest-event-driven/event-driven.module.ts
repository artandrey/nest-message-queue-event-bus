import { Module, OnApplicationBootstrap } from '@nestjs/common';

import { EventBus } from './event-bus';
import { ExplorerService } from './services/explorer.service';
import { HandlerRegister } from './services/handlers-register.service';

@Module({ providers: [ExplorerService, EventBus, HandlerRegister], exports: [EventBus] })
export class EventDrivenModule implements OnApplicationBootstrap {
  constructor(
    private readonly explorerService: ExplorerService,
    private readonly eventBus: EventBus,
  ) {}

  onApplicationBootstrap() {
    const { events } = this.explorerService.explore();

    this.eventBus.register(events);
  }
}
