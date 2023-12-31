import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { Server, Socket } from 'socket.io';
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

    @WebSocketServer()
    public server: Server;

    private extractTokenFromHeader(cookie: string): string | undefined {
        const tokens = cookie?.split('; ');
        if (!tokens) return undefined;
        for (const token of tokens) {
            if (token.startsWith('access_token=')) return token.split('=')[1];
        }
        return undefined;
    }

    handleConnection(client: Socket) {
        try {
            const tokenString: string = this.extractTokenFromHeader(client.handshake.headers.cookie);
            const decodedToken = this.jwtService.verify(tokenString, {
                secret: process.env.JWT_SECRET_KEY,
            });
            this.socketService.addClient(client, decodedToken.userId);
            client.emit('updateRoomList', this.socketService.getRooms(this.server));
        } catch (e) {
            this.logger.error(e);
            client.disconnect(true);
        }
        this.logger.log(`Client connected: ${client.id}`);

        client.on('disconnecting', (reason) => {
            try {
                this.socketService.deleteClient(client);
                this.logger.log(`Client disconnected: ${client.id}`);
            } catch (e) {
                this.logger.error(e);
            }
        });
    }

    @SubscribeMessage('createRoom')
    async createRoom(client: Socket, roomName: string) {
        this.logger.log(`Client ${client.id} called createRoom()`);
        try {
            const uniqueRoomName: string = roomName + ' by ' + client.id;
            await this.socketService.createRoom(this.server, client, uniqueRoomName);
            this.server.emit('updateRoomList', this.socketService.getRooms(this.server));
        } catch (e) {
            this.logger.error(e);
            client.emit('eventFailure', e.message);
        }
    }

    @SubscribeMessage('joinRoom')
    async joinRoom(client: Socket, roomName: string): Promise<void> {
        this.logger.log(`Client ${client.id} called joinRoom()`);
        try {
            await this.socketService.joinRoom(this.server, client, roomName);
            this.server.emit('updateRoomList', this.socketService.getRooms(this.server));
            this.server.to(roomName).emit('welcome');
        } catch (e) {
            this.logger.error(e);
            client.emit('eventFailure', e.message);
        }
    }

    @SubscribeMessage('leaveRoom')
    async leaveRoom(client: Socket, roomName: string): Promise<void> {
        this.logger.log(`Client ${client.id} called leaveRoom()`);
        try {
            this.socketService.leaveRoom(client, roomName);
            this.server.emit('updateRoomList', this.socketService.getRooms(this.server));
        } catch (e) {
            this.logger.error(e);
            client.emit('eventFailure', e.message);
        }
    }

    @SubscribeMessage('changeReadyStatus')
    async changeReadyStatus(client: Socket, roomName: string) {
        this.logger.log(`Client ${client.id} called changeReadyStatus()`);
        try {
            this.socketService.changeReadyStatus(this.server, client, roomName);
        } catch (e) {
            this.logger.error(e);
        }
    }

    @SubscribeMessage('updateGameState')
    async updateGameState(client: Socket, payload: JSON): Promise<void> {
        this.logger.log(`Client ${client.id} called updateGameState()`);
        try {
            await this.socketService.updateGameState(this.server, client, payload);
        } catch (e) {
            this.logger.error(e);
        }
    }

    @SubscribeMessage('fetchRoomStatus')
    async fetchRoomStatus(client: Socket, roomName: string) {
        this.logger.log(`Client ${client.id} called fetchRoomStatus()`);
        try {
            this.server.to(roomName).emit('updateRoomStatus', await this.socketService.getRoomInfo(this.server, roomName));
        } catch (e) {
            this.logger.error(e);
        }
    }

    @SubscribeMessage('offer')
    handleOffer(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        this.server.to(data.roomName).except(client.id).emit('offer', data.offer);
    }

    @SubscribeMessage('answer')
    handleAnswer(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        this.server.to(data.roomName).except(client.id).emit('answer', data.answer);
    }

    @SubscribeMessage('ice')
    handleIce(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        this.server.to(data.roomName).except(client.id).emit('ice', data.ice);
    }
}
