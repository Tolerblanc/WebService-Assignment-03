class Home {
    template() {
        return `
    <header>
    <button id="createRoomButton" onclick="openModal()">방 생성</button>
    <button id="viewRecordButton">전적 보기</button>
    </header>

    <div id="createRoomModal" style="display: none">
        <label for="roomName">방 제목:</label>
        <input type="text" id="roomName" />
        <button onclick="createRoom()">확인</button>
        <button onclick="closeModal()">취소</button>
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
