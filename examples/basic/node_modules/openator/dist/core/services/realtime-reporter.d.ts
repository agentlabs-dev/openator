import { EventEmitter } from 'events';
import { AppEvents, EventBusInterface } from '../interfaces/event-bus.interface';
export declare class EventBus extends EventEmitter implements EventBusInterface {
    emit<E extends keyof AppEvents>(event: E, data: AppEvents[E]): boolean;
    on<E extends keyof AppEvents>(event: E, callback: (data: AppEvents[E]) => void): this;
}
