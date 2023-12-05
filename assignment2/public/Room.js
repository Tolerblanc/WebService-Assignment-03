import { socket } from './main.js';
import { moveSlider, changeSpeed, speed, direction } from './Slider.js';
// export interface Game {
//     players: string[];
//     turn: number; // 0: player1, 1: player2 ... 3: player4
//     targetHP: number;
//     maxHit: number;
//     maxHitPlayer: string;
//     lastHit: 0,
//     lastHitPlayer: '',
// }

class Room {
    constructor() {
        this.roomName = '';
        this.userName = '';
        this.sliderIntervalId = null;
        this.speedIntervalId = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.addEventListener('click', (event) => {
            if (event.target.id === 'readyButton') {
                socket.emit('changeReadyStatus', this.roomName);
                readyButton.style.display = 'none';
            }
        });
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

        socket.off('startGame');
        socket.on('startGame', (gameInfo) => {
            this.showGameComponent();
            this.updatePlayerList(gameInfo);
        });

        socket.off('updateGameState');
        socket.on('updateGameState', (gameInfo) => {
            this.updatePlayerList(gameInfo);
            this.updateGameInfo(gameInfo);
        });

        socket.off('endGame');
        socket.on('endGame', (gameResult) => {
            this.hideSliderComponent();
            this.hideGameComponent();
            this.showResult(gameResult);
        });
    }

    updateRoomStatus(roomInfo) {
        this.roomName = roomInfo.roomName;
        document.getElementById('roomName').textContent = `Room : ${this.roomName}`;
        roomInfo.players.forEach((player, index) => {
            const playerElement = document.getElementById(`player${index + 1}`);
            playerElement.querySelector('.playerName').textContent = player;
            playerElement.querySelector('.playerStatus').textContent = roomInfo.readyStatus[index] ? '준비 완료' : '대기중';

            // 자신의 준비 버튼 표시
            if (player.name === this.userName) {
                readyButton.style.display = 'block';
            }
        });
    }

    updatePlayerList(gameInfo) {
        let showbutton = false;
        const hitSliderButton = document.getElementById('hitSliderButton');
        gameInfo.players.forEach((player, index) => {
            const playerElement = document.getElementById(`player${index + 1}`);
            playerElement.querySelector('.playerName').textContent = player;
            playerElement.querySelector('.playerStatus').textContent = gameInfo.turn == index ? '<-- 현재 차례' : '';
            if (gameInfo.turn == index && player === this.userName) {
                showbutton = true;
            }
        });
        if (showbutton) {
            hitSliderButton.style.display = 'block';
        }
    }

    leaveRoom() {
        socket.emit('leaveRoom', this.roomName);
    }

    showResult(gameResult) {
        const gameArea = document.querySelector('.game-area');
        gameArea.innerHTML = `
        <div> 최종 결과 </div>
        <div id = "result"> </div>
        <div id = "maxHit"> 최대 데미지 : ${gameResult.maxHit} by ${gameResult.maxHitPlayer} </div>
        <div>다시 하려면 준비 버튼을 눌러주세요. </div>
        <button onclick="location.href='/';">홈으로</button>
        `;
        document.getElementById('result').textContent = this.userName === gameResult.winner ? '이겼어요!' : '졌어요...';
        document.getElementById('readyButton').style.display = 'block';
    }

    showGameComponent() {
        const gameArea = document.querySelector('.game-area');
        gameArea.innerHTML = `
        <div class="slider-container" style="position: relative; width: 300px; height: 50px; background-color: #eee; margin: 10px;">
            <!-- 여기에 슬라이더가 그려짐 -->
        </div>
        <br>
        <br>
        <br>
        <button id="hitSliderButton">멈추기</button>
        <div id="targetHP"></div>
        <div id="maxHit"></div>
        <br>
        <br>
        `;
        document.addEventListener('click', (event) => {
            if (event.target.id === 'hitSliderButton') {
                this.hitSlider();
            }
        });
    }

    hideGameComponent() {
        const gameArea = document.querySelector('.game-area');
        gameArea.innerHTML = ``;
    }

    showSliderComponent() {
        const sliderArea = document.querySelector('.slider-container');
        sliderArea.innerHTML = `
        <div id="slider" style="position: absolute; width: 30px; height: 50px; background-color: #007bff;"></div>
        `;
        this.startSlider();
    }

    startSlider() {
        if (this.sliderIntervalId !== null) {
            clearInterval(this.sliderIntervalId);
        }
        if (this.speedIntervalId !== null) {
            clearInterval(this.speedIntervalId);
        }
        this.sliderIntervalId = setInterval(moveSlider, 10);
        this.speedIntervalId = setInterval(changeSpeed, 1000);
    }

    hitSlider() {
        const slider = document.getElementById('slider');
        const sliderContainer = document.querySelector('.slider-container');
        if (!slider || !sliderContainer) {
            console.log('Slider or slider container not found');
            return;
        }
        const sliderPosition = slider.offsetLeft;
        const containerWidth = sliderContainer.offsetWidth;
        const sliderWidth = slider.offsetWidth;
        const value = Math.floor((sliderPosition / (containerWidth - sliderWidth)) * 100);
        socket.emit('updateGameState', { roomName: this.roomName, currentPlayer: this.userName, hit: value });
        const gameArea = document.querySelector('.slider-container');
        gameArea.innerHTML = `
        <div> damage : ${value} </div>
        `;
        document.getElementById('hitSliderButton').style.display = 'none';
    }

    hideSliderComponent() {
        const gameArea = document.querySelector('.slider-container');
        gameArea.innerHTML = ``;
        clearInterval(this.sliderIntervalId);
        clearInterval(this.speedIntervalId);
    }

    updateGameInfo(gameInfo) {
        document.getElementById('targetHP').textContent = `병뚜껑 체력: ${gameInfo.targetHP}`;
        document.getElementById('maxHit').textContent = `maxHit : ${gameInfo.maxHit} by ${gameInfo.maxHitPlayer}`;
        if (gameInfo.turn == gameInfo.players.indexOf(this.userName)) {
            this.showSliderComponent();
        } else {
            this.hideSliderComponent();
        }
    }

    template() {
        return `
        <h2 id="roomName">Room</h1>
        <!-- 게임 영역 -->
        <div class="game-area">
            <!-- 여기에 게임이 그려짐 -->
        </div>

        <!-- 플레이어 정보 영역 -->
        <div id="players">
        <!-- 각 플레이어 정보가 들어갈 칸 -->
        <div class="player" id="player1"><span class="playerName"><!-- 플레이어 1의 이름 --></span> <span class="playerStatus"><!-- 준비 상태 --></span></div>
        <div class="player" id="player2"><span class="playerName"><!-- 플레이어 2의 이름 --></span> <span class="playerStatus"><!-- 준비 상태 --></span></div>
        <div class="player" id="player3"><span class="playerName"><!-- 플레이어 3의 이름 --></span> <span class="playerStatus"><!-- 준비 상태 --></span></div>
        <div class="player" id="player4"><span class="playerName"><!-- 플레이어 4의 이름 --></span> <span class="playerStatus"><!-- 준비 상태 --></span></div>
    </div>

    <!-- 자신의 준비 버튼 -->
    <button id="readyButton">준비</button>
    `;
    }
}
export default new Room();
