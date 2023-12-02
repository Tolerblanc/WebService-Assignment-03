import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SocketService {
    private readonly logger = new Logger(SocketService.name);
    private clients: Map<string, Socket> = new Map<string, Socket>();
    private rooms: Map<string, number> = new Map<string, number>(); // roomName: number of clients

    addClient(client: Socket, userId: string) {
        this.clients.set(userId, client);
    }

    deleteClient(client: Socket, userId: string) {
        this.clients.delete(userId);
    }
}
