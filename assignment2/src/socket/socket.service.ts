import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Game } from './game.interface';

@Injectable()
export class SocketService {
    private readonly logger = new Logger(SocketService.name);
    private clients: Map<string, string> = new Map<string, string>(); // socket.id: userId
    private isReady: Map<string, boolean> = new Map<string, boolean>(); // socketId: boolean
    private game: Map<string, Game> = new Map<string, Game>(); // roomName: Game

    addClient(client: Socket, userId: string) {
        this.clients.set(client.id, userId);
    }

    deleteClient(client: Socket) {
        if (client.rooms.size > 1) {
            const roomName = Array.from(client.rooms)[1];
            this.leaveRoom(client, roomName);
        }
        this.clients.delete(client.id);
        this.isReady.delete(client.id);
    }

    getRooms(server: Server): string {
        const rooms = server.sockets.adapter.rooms;
        const roomList = new Map<string, number>();
        rooms.forEach((value, key) => {
            if (this.clients.get(key) === undefined) roomList.set(key, value.size);
        });
        return JSON.stringify(Array.from(roomList));
    }

    createRoom(server: Server, client: Socket, roomName: string) {
        client.join(roomName);
        client.emit('setUserName', this.clients.get(client.id));
        server.to(roomName).emit('updateRoomStatus', this.getRoomInfo(server, roomName));
    }

    getRoomInfo(server: Server, roomName: string) {
        const room = server.sockets.adapter.rooms.get(roomName);
        const players = Array.from(room).map((socketId) => this.clients.get(socketId));
        return {
            roomName: roomName,
            players: players,
        };
    }

    joinRoom(server: Server, client: Socket, roomName: string) {
        const room = server.sockets.adapter.rooms.get(roomName);
        if (room === undefined || room.size <= 0) throw new Error('방이 존재하지 않습니다.');
        if (room.size >= 4) throw new Error('방이 가득차서 들어갈 수 없습니다.');
        client.join(roomName);
        client.emit('setUserName', this.clients.get(client.id));
        server.to(roomName).emit('updateRoomStatus', this.getRoomInfo(server, roomName));
    }

    leaveRoom(client: Socket, roomName: string) {
        client.leave(roomName);
    }
}

// const game = this.game.get(roomName);
//         return {
//             players,
//             turn: game.turn,
//             targetHP: game.targetHP,
//             maxHit: game.maxHit,
//             maxHitPlayer: game.maxHitPlayer,
//         };
