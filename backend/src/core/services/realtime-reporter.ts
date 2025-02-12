import { EventEmitter } from 'events';
import {
  AppEvents,
  EventBusInterface,
} from '../interfaces/event-bus.interface';

export class EventBus extends EventEmitter implements EventBusInterface {
  emit<E extends keyof AppEvents>(event: E, data: AppEvents[E]): boolean {
    console.log(`Event emitted: ${event}`, data);
    return super.emit(event, data);
  }

  on<E extends keyof AppEvents>(
    event: E,
    callback: (data: AppEvents[E]) => void,
  ): this {
    console.log(`Listener added for event: ${event}`);
    return super.on(event, callback);
  }
}
