# 2023-2-WebService-Assignment 2

## TODO

-   GET /users/records : JWT 토큰으로 전적 조회하는 API
-   gameResult.html : 승패 결과에 따라 다른 화면 출력
-   gameRoom.html : 게임 방 출력 (대기 + 게임 진행)

## Server-side emit events

-   updateRoomList : 방 리스트 업데이트 시
-   startGame : 4명이 모두 준비 완료되었을 때 게임 시작
-   endGame : 병뚜껑 체력이 0일 때 게임 종료 (기록 갱신 후 승자, 패자 페이지로 이동)
-   updateGameState : 게임 상태 변경 (병뚜껑 체력 갱신 후 턴 변경 + 가장 높은 hit 출력)

## Client-side emit events

-   createRoom : 방을 생성할 시
-   joinRoom : 방을 클릭해서 들어갈 시
-   leaveRoom : 방을 나오거나 방에 들어간 채로 접속이 끊길 시
-   changeReadyStatus : 준비 상태 변경
-   updateGameState : 게임 상태 변경 (현재 플레이어의 hit)
