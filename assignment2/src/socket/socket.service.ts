import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Game } from './game.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SocketService {
    private readonly logger = new Logger(SocketService.name);
    private clients: Map<string, string> = new Map<string, string>(); // socket.id: userId
    private isReady: Set<string> = new Set<string>(); // socket.id
    private game: Map<string, Game> = new Map<string, Game>(); // roomName: Game

    constructor(private userService: UserService) {}

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
        const readyStatus = Array.from(room).map((socketId) => this.isReady.has(socketId));
        return {
            roomName: roomName,
            players: players,
            readyStatus: readyStatus,
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

    changeReadyStatus(server: Server, client: Socket, roomName: string) {
        this.isReady.add(client.id);
        const players = server.sockets.adapter.rooms.get(roomName);
        server.to(roomName).emit('updateRoomStatus', this.getRoomInfo(server, roomName));
        if (players.size < 4) return; // TODO: 4명이 안되면 게임 시작 불가토록 수정 필요
        for (const socketId of players) {
            if (!this.isReady.has(socketId)) return;
        }
        for (const socketId of players) {
            this.isReady.delete(socketId);
        }
        this.startGame(server, roomName);
    }

    startGame(server: Server, roomName: string) {
        this.logger.log(`Game started in ${roomName}`);
        const room = server.sockets.adapter.rooms.get(roomName);
        const players = Array.from(room).map((socketId) => this.clients.get(socketId));
        players.sort(() => Math.random() - 0.5); // 플레이어 순서 셔플
        const game: Game = {
            players: players,
            turn: 0,
            targetHP: 100,
            maxHit: 0,
            maxHitPlayer: '',
            lastHit: 0,
            lastHitPlayer: '',
        };
        this.game.set(roomName, game);
        server.to(roomName).emit('startGame', game);
        server.to(roomName).emit('updateGameState', game);
    }

    async updateGameState(server: Server, client: Socket, payload: JSON) {
        // payload: { currentPlayer: string, roomName: string, hit: number } hit 0~100
        const currGame = this.game.get(payload['roomName']);
        if (currGame === undefined) throw new Error('게임을 찾을 수 없습니다.');
        if (currGame.maxHit < payload['hit']) {
            currGame.maxHit = payload['hit'];
            currGame.maxHitPlayer = payload['currentPlayer'];
        }
        if (currGame.targetHP <= payload['hit']) {
            await this.endGame(server, payload['currentPlayer'], payload['roomName']);
            return;
        }
        currGame.turn = (currGame.turn + 1) % 4; // TODO : 4명으로 수정 필요
        currGame.targetHP -= payload['hit'];
        currGame.lastHit = payload['hit'];
        currGame.lastHitPlayer = payload['currentPlayer'];
        this.game.set(payload['roomName'], currGame);
        server.to(payload['roomName']).emit('updateGameState', currGame);
    }

    async endGame(server: Server, winner: string, roomName: string) {
        const currGame = this.game.get(roomName);
        for (const player of currGame.players) {
            if (player === winner) await this.userService.updateRecord(player, true);
            else await this.userService.updateRecord(player, false);
        }
        const gameResult = {
            winner: winner,
            maxHit: currGame.maxHit,
            maxHitPlayer: currGame.maxHitPlayer,
        };
        server.to(roomName).emit('endGame', gameResult);
        server.to(roomName).emit('updateRoomStatus', this.getRoomInfo(server, roomName));
    }
}
