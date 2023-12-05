import { changeUrl, socket } from './main.js';

class Home {
    constructor() {
        // 이벤트 리스너 초기화
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.addEventListener('click', (event) => {
            if (event.target.id === 'createRoomButton') {
                this.openModal();
            } else if (event.target.id === 'closeModalButton') {
                this.closeModal();
            } else if (event.target.id === 'emitRoomCreationButton') {
                this.createRoom();
            }
        });
    }

    initializeSocketListeners() {
        socket.removeAllListeners();

        socket.off('updateRoomList');
        socket.on('updateRoomList', (rooms) => {
            this.updateRoomList(rooms);
        });

        socket.off('eventFailure');
        socket.on('eventFailure', (message) => {
            alert(message);
        });
    }

    createRoom() {
        socket.emit('createRoom', roomName.value);
        changeUrl('/room');
    }

    openModal() {
        document.getElementById('createRoomModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('createRoomModal').style.display = 'none';
    }

    updateRoomList(rooms) {
        const roomList = document.getElementById('roomList');
        roomList.innerHTML = ''; // 목록 초기화

        let roomMap = new Map(JSON.parse(rooms));
        if (roomMap.length === 0) {
            return;
        }
        roomMap?.forEach((count, roomName) => {
            if (count === null || count == 0 || count >= 4) {
                return;
            }
            const li = document.createElement('button');
            li.textContent = `${roomName} (${count} / 4)`;
            li.onclick = () => this.enterRoom(roomName); // 방 입장 이벤트 처리
            roomList.appendChild(li);
            roomList.appendChild(document.createElement('br'));
        });
    }

    enterRoom(roomName) {
        changeUrl('/room');
        socket.emit('joinRoom', roomName);
    }

    template() {
        return `
    <header>
    <button id="createRoomButton">방 생성</button>
    <button id="viewRecordButton">전적 보기</button>
    </header>

    <div id="createRoomModal" style="display: none">
        <label for="roomName">방 제목:</label>
        <input type="text" id="roomName" />
        <button id="emitRoomCreationButton">확인</button>
        <button id="closeModalButton">취소</button>
    </div>

    <section id="roomListSection">
        <h2>활성 게임 방</h2>
        <ul id="roomList">
            <!-- 여기에 방 목록이 동적으로 삽입됨 -->
        </ul>
    </section>
    `;
    }
}
export default new Home();
