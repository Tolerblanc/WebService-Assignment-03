import { socket, changeUrl } from './main.js';
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
        this.turnTimerId = null;
        this.myStream = null;
        this.muted = false;
        this.cameraOff = false;
        this.myPeerConnection = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.addEventListener('click', (event) => {
            if (event.target.id === 'readyButton') {
                socket.emit('changeReadyStatus', this.roomName);
                readyButton.style.display = 'none';
            }
            if (event.target.id === 'mute') {
                this.handleMuteClick();
            }
            if (event.target.id === 'camera') {
                this.handleCameraClick();
            }
        });
        document.addEventListener('input', (event) => {
            if (event.target.id === 'cameras') {
                this.handleCameraChange();
            }
            if (event.target.id === 'mics') {
                this.handleMicChange();
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

        socket.off('welcome');
        socket.on('welcome', async () => {
            await this.ensureMediaStreamInitialized();
            await this.ensureConnectionInitialized();
            const offer = await this.myPeerConnection.createOffer();
            this.myPeerConnection.setLocalDescription(offer);
            socket.emit('offer', offer, this.roomName);
        });

        socket.off('offer');
        socket.on('offer', async (offer) => {
            this.myPeerConnection.setRemoteDescription(offer);
            const answer = await this.myPeerConnection.createAnswer();
            this.myPeerConnection.setLocalDescription(answer);
            socket.emit('answer', answer, this.roomName);
        });

        socket.off('answer');
        socket.on('answer', (answer) => {
            this.myPeerConnection.setRemoteDescription(answer);
        });

        socket.off('ice');
        socket.on('ice', (ice) => {
            this.myPeerConnection.addIceCandidate(ice);
        });
    }

    updateRoomStatus(roomInfo) {
        this.roomName = roomInfo.roomName;
        document.getElementById('roomName').textContent = `Room : ${this.roomName}`;
        for (let index = 1; index <= 2; index++) {
            const playerElement = document.getElementById(`player${index}`);
            playerElement.querySelector('.playerName').textContent = '';
            playerElement.querySelector('.record').textContent = '';
            playerElement.querySelector('.playerStatus').textContent = '';
        }
        roomInfo.players.forEach((player, index) => {
            const playerElement = document.getElementById(`player${index + 1}`);
            playerElement.querySelector('.playerName').textContent = player;
            playerElement.querySelector('.record').textContent = `전적 : ${roomInfo.records[index]}`;
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
        <button id="returnHome">홈으로</button>
        `;
        document.getElementById('result').textContent = this.userName === gameResult.winner ? '이겼어요!' : '졌어요...';
        document.getElementById('readyButton').style.display = 'block';
        const returnHomeButton = document.getElementById('returnHome');
        returnHomeButton.addEventListener('click', async () => {
            this.leaveRoom();
            socket.emit('fetchRoomStatus', this.roomName);
            await changeUrl('/');
        });
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
        this.startTurnTimer();
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

    startTurnTimer() {
        if (this.turnTimerId !== null) {
            clearTimeout(this.turnTimerId);
        }

        this.turnTimerId = setTimeout(() => {
            this.endTurn();
        }, 10000); // 10초 후 타이머 종료
    }

    endTurn() {
        // 타이머 종료 로직 (대미지 값 0으로 턴 종료)
        socket.emit('updateGameState', { roomName: this.roomName, currentPlayer: this.userName, hit: 0 });
        this.hideSliderComponent();
        const gameArea = document.querySelector('.slider-container');
        gameArea.innerHTML = `
        <div> damage : 0 </div>
        `;
        document.getElementById('hitSliderButton').style.display = 'none';
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
        clearTimeout(this.turnTimerId);
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

    async getCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter((device) => device.kind === 'videoinput');
            const currentCamera = this.myStream.getVideoTracks()[0];
            const cameraSelect = document.getElementById('cameras');
            cameras.forEach((camera) => {
                const option = document.createElement('option');
                option.value = camera.deviceId;
                option.innerText = camera.label;
                if (currentCamera.label == camera.label) {
                    option.selected = true;
                }
                cameraSelect.appendChild(option);
            });
        } catch (e) {
            console.log(e);
        }
    }

    async getMics() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const mics = devices.filter((device) => device.kind === 'audioinput');
            const currentMic = this.myStream.getAudioTracks()[0];
            const micSelect = document.getElementById('mics');
            mics.forEach((mic) => {
                const option = document.createElement('option');
                option.value = mic.deviceId;
                option.innerText = mic.label;
                if (currentMic.label == mic.label) {
                    option.selected = true;
                }
                micSelect.appendChild(option);
            });
        } catch (e) {
            console.log(e);
        }
    }

    async getMedia(deviceId) {
        const initialConstraints = {
            audio: true,
            video: { facingMode: 'user' },
        };

        const cameraConstraints = {
            audio: true,
            video: { deviceId: { exact: deviceId } },
        };

        try {
            this.myStream = await navigator.mediaDevices.getUserMedia(deviceId ? cameraConstraints : initialConstraints);
            const myFace = document.getElementById('myFace');
            myFace.srcObject = this.myStream;
            if (!deviceId) {
                await this.getCameras();
                await this.getMics();
            }
        } catch (e) {
            console.log(e);
        }
    }

    handleMuteClick() {
        const muteBtn = document.getElementById('mute');
        this.myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
        if (!this.muted) {
            muteBtn.innerText = 'Unmute';
            this.muted = true;
        } else {
            muteBtn.innerText = 'Mute';
            this.muted = false;
        }
    }

    handleCameraClick() {
        const cameraBtn = document.getElementById('camera');
        this.myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
        if (!this.cameraOff) {
            cameraBtn.innerText = 'Turn On Camera';
            this.cameraOff = true;
        } else {
            cameraBtn.innerText = 'Turn Off Camera';
            this.cameraOff = false;
        }
    }

    async handleCameraChange() {
        const cameraSelect = document.getElementById('cameras');
        await this.getMedia(cameraSelect.value);
        if (this.myPeerConnection) {
            const videoTrack = this.myStream.getVideoTracks()[0];
            const videoSender = this.myPeerConnection.getSenders().find((sender) => sender.track.kind === 'video');
            videoSender.replaceTrack(videoTrack);
        }
    }

    async handleMicChange() {
        const micSelect = document.getElementById('mics');
        await this.getMedia(micSelect.value);
        if (this.myPeerConnection) {
            const audioTrack = this.myStream.getAudioTracks()[0];
            const audioSender = this.myPeerConnection.getSenders().find((sender) => sender.track.kind === 'audio');
            audioSender.replaceTrack(audioTrack);
        }
    }

    async startMedia() {
        await this.getMedia();
        await this.ensureConnectionInitialized();
    }

    async ensureMediaStreamInitialized() {
        if (!this.myStream) {
            await this.startMedia();
        }
    }

    async ensureConnectionInitialized() {
        if (!this.myPeerConnection) {
            await this.makeConnection();
        }
    }

    makeConnection() {
        return new Promise((resolve) => {
            this.myPeerConnection = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: ['stun:stun.stunprotocol.org'],
                    },
                ],
            });
            this.myPeerConnection.addEventListener('icecandidate', this.handleIce);
            this.myPeerConnection.addEventListener('track', (event) => {
                const peerFace = document.getElementById('peerFace');
                if (peerFace.srcObject !== event.streams[0]) {
                    peerFace.srcObject = event.streams[0];
                }
            });
            this.myStream.getTracks().forEach((track) => this.myPeerConnection.addTrack(track, this.myStream));
            resolve();
        });
    }

    handleIce(data) {
        socket.emit('ice', data.candidate, roomName);
    }

    handleAddStream(data) {
        const peerFace = document.getElementById('peerFace');
        peerFace.srcObject = data.stream;
    }

    template() {
        return `
        <style>
            .player {
                margin-bottom: 10px;
            }
            
            .video-container {
                width: 160px;
                height: 120px;
                background-color: #000;
            }
            
            video {
                width: 100%;
                height: auto;
            }

            .controls {
                margin-top: 10px;
            }
        </style>
        <h2 id="roomName">Room</h1>
        <!-- 게임 영역 -->
        <div class="game-area">
            <!-- 여기에 게임이 그려짐 -->
        </div>

        <!-- 플레이어 정보 영역 -->
        <div id="players">
            <div class="player" id="player1">
                <div class="playerName"></div>
                <span class="record"></span> 
                <span class="playerStatus"></span>
                <div class="video-container">
                    <video id="myFace" autoplay playsinline width="300" height="300"></video>
                    <button id="mute">Mute</button> <button id="camera">Turn On Camera</button>
                    <select id="mics"></select> <select id="cameras"></select>
                </div>
            </div>
            <br>
            <br>
            <br>
            <br>
            <div class="player" id="player2">
                <div class="playerName"></div>
                <span class="record"></span>
                <span class="playerStatus"></span>
                <div class="video-container">
                    <video id="peerFace" autoplay playsinline width="300" height="300"></video>
                </div>
            </div>
        </div>
        <br>
        <!-- 준비 버튼 -->
        <button id="readyButton">준비</button>
    `;
    }
}
export default new Room();
