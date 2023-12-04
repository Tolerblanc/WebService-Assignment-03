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
        socket.off('updateRoomList');
        socket.on('updateRoomList', (rooms) => {
            this.updateRoomList(rooms);
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
        console.log(rooms);
        const roomList = document.getElementById('roomList');
        roomList.innerHTML = ''; // 목록 초기화

        rooms.forEach((room) => {
            const li = document.createElement('li');
            li.textContent = `${room.name} (${room.currentCount} / 4)`;
            li.onclick = () => this.enterRoom(room.name); // 방 입장 이벤트 처리
            roomList.appendChild(li);
        });
    }

    enterRoom(roomName) {
        socket.emit('joinRoom', roomName);
        changeUrl('/room');
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
