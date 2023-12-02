import { Logger } from '@nestjs/common';
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
    port: 3000,
    transport: ['websocket'],
    cors: true,
})
export class SocketGateway implements OnGatewayConnection {
    private readonly logger = new Logger(SocketGateway.name);
    constructor(
        private socketService: SocketService,
        private jwtService: JwtService,
    ) {}

    handleConnection(client: Socket) {
        try {
            const tokenString: string = client.request.headers.cookie?.split('=')[1] as string;
            const decodedToken = this.jwtService.verify(tokenString, {
                secret: process.env.JWT_SECRET_KEY,
            });
            this.socketService.addClient(client, decodedToken.userId);
        } catch (e) {
            this.logger.error(e);
            client.disconnect(true);
        }
        this.logger.log(`Client connected: ${client.id}`);

        client.on('disconnecting', (reason) => {
            try {
                const tokenString: string = client.request.headers.cookie?.split('=')[1] as string;
                const decodedToken = this.jwtService.verify(tokenString, {
                    secret: process.env.JWT_SECRET_KEY,
                });
                this.socketService.deleteClient(client, decodedToken.userId);
            } catch (e) {
                this.logger.error(e);
            }
        });
    }

    @SubscribeMessage('createRoom')
    async createRoom(client: Socket, payload: JSON): Promise<void> {
        this.logger.log(`Client ${client.id} called createRoom()`);
        try {
            // await this.socketService.createRoom(client, payload['roomName']);
        } catch (e) {
            this.logger.error(e);
        }
    }

    @SubscribeMessage('joinRoom')
    async joinRoom(client: Socket, payload: JSON): Promise<void> {
        this.logger.log(`Client ${client.id} called joinRoom()`);
        try {
            // await this.socketService.joinRoom(client, payload);
        } catch (e) {
            this.logger.error(e);
        }
    }

    @SubscribeMessage('leaveRoom')
    async leaveRoom(client: Socket, payload: JSON): Promise<void> {
        this.logger.log(`Client ${client.id} called leaveRoom()`);
        try {
            // await this.socketService.leaveRoom(client, payload);
        } catch (e) {
            this.logger.error(e);
        }
    }

    @SubscribeMessage('changeReadyStatus')
    async changeReadyStatus(client: Socket, payload: JSON): Promise<void> {
        this.logger.log(`Client ${client.id} called changeReadyStatus()`);
        try {
            // await this.socketService.changeReadyStatus(client, payload);
        } catch (e) {
            this.logger.error(e);
        }
    }

    @SubscribeMessage('updateGameState')
    async updateGameState(client: Socket, payload: JSON): Promise<void> {
        this.logger.log(`Client ${client.id} called updateGameState()`);
        try {
            // await this.socketService.updateGameState(client, payload);
        } catch (e) {
            this.logger.error(e);
        }
    }
}
