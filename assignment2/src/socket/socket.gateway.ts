import { Logger } from '@nestjs/common';
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { Socket } from 'socket.io';

@WebSocketGateway({
    port: 3000,
    transport: ['websocket'],
    cors: true,
})
export class SocketGateway implements OnGatewayConnection {
    private readonly logger = new Logger(SocketGateway.name);
    constructor(private socketService: SocketService) {}

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }
}
