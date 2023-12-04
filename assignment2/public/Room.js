import { socket } from './main.js';

// export interface Game {
//     players: string[];
//     turn: number; // 0: player1, 1: player2 ... 3: player4
//     targetHP: number;
//     maxHit: number;
//     maxHitPlayer: string;
// }

class Room {
    constructor() {
        let roomName = '';
        let userName = '';
    }

    initializeSocketListeners() {
        socket.off('updateRoomList');

        socket.off('updateRoomStatus');
        socket.on('updateRoomStatus', (roomInfo) => {
            this.updateRoomStatus(roomInfo);
        });

        socket.off('setUserName');
        socket.on('setUserName', (userName) => {
            this.userName = userName;
        });
    }

    updateRoomStatus(roomInfo) {
        this.roomName = roomInfo.roomName;
        document.getElementById('roomName').textContent = `${this.userName}님, ${this.roomName} 방에 입장하셨습니다. <br>
        roomInfo: ${JSON.stringify(roomInfo)}`;
    }

    leaveRoom() {
        console.log('leaveRoom');
        socket.emit('leaveRoom', this.roomName);
    }

    template() {
        return `
    <h1>Room</h1>
    <p id="roomName">오류 발생! 홈으로 이동하세요.</p>
    `;
    }
}
export default new Room();
