import { EventEmitter } from 'events';
export class EventBus extends EventEmitter {
    emit(event, data) {
        return super.emit(event, data);
    }
    on(event, callback) {
        return super.on(event, callback);
    }
}
//# sourceMappingURL=realtime-reporter.js.map