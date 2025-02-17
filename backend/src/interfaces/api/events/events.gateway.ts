import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { socketEventBus } from './event-bus';

@WebSocketGateway({ cors: { origin: '*' } }) // Allow all origins for development
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('job:subscribe')
  async handleMessage(@MessageBody() data: void) {
    console.log('job:subscribe', data);
    socketEventBus.on('run:update', (run) => {
      if (!run) {
        return;
      }

      this.server.emit(`job:update:${run.id}`, run);
    });
  }
}
