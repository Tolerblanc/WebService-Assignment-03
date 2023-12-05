import Home from './Home.js';
import Record from './Record.js';
import Room from './Room.js';
import { io } from 'https://cdn.socket.io/4.7.2/socket.io.esm.min.js';

export const socket = io();
const $app = document.querySelector('.App');

const routes = {
    '/': Home,
    '/record': Record,
    '/room': Room,
};

$app.innerHTML = routes['/'].template();

if (socket.connected) {
    routes['/'].initializeSocketListeners();
} else {
    socket.on('connect', () => {
        routes['/'].initializeSocketListeners();
    });
}

export const changeUrl = (requestedUrl) => {
    // history.pushState를 사용해 url을 변경한다.
    history.pushState(null, null, requestedUrl);

    // routes 배열에서 url에 맞는 컴포넌트를 찾아 main.App에 렌더링 한다.
    $app.innerHTML = routes[requestedUrl].template();

    if (requestedUrl === '/record') {
        routes['/record'].updateRecord();
    } else if (requestedUrl === '/') {
        routes['/'].initializeSocketListeners();
    } else if (requestedUrl === '/room') {
        routes['/room'].initializeSocketListeners();
    }
};

window.addEventListener('click', (e) => {
    if (e.target.id === 'viewRecordButton') {
        changeUrl('/record');
    }
});

window.addEventListener('popstate', () => {
    const currentPath = window.location.pathname;

    // /room 페이지를 벗어났는지 확인
    if (!currentPath.startsWith('/room')) {
        routes['/room'].leaveRoom();
    }
    changeUrl(currentPath);
});

window.addEventListener('beforeunload', () => {
    if (window.location.pathname.startsWith('/room')) {
        // /room 페이지를 벗어날 때 필요한 작업
        routes['/room'].leaveRoom();
    }
    changeUrl(window.location.pathname);
});
