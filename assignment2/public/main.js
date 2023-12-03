import Home from './Home.js';
import Record from './Record.js';

const $app = document.querySelector('.App');

const routes = {
    '/': Home,
    '/record': Record,
};

$app.innerHTML = routes['/'].template();

export const changeUrl = (requestedUrl) => {
    // history.pushState를 사용해 url을 변경한다.
    history.pushState(null, null, requestedUrl);

    // routes 배열에서 url에 맞는 컴포넌트를 찾아 main.App에 렌더링 한다.
    $app.innerHTML = routes[requestedUrl].template();

    if (requestedUrl === '/record') {
        routes['/record'].updateRecord();
    }
};

window.addEventListener('click', (e) => {
    console.log(e.target);
    if (e.target.id === 'viewRecordButton') {
        changeUrl('/record');
    } else if (e.target.id === 'createRoomButton') {
        alert('방 생성 버튼 클릭');
    }
});

window.addEventListener('popstate', () => {
    changeUrl(window.location.pathname);
});
