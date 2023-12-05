export interface Game {
    players: string[];
    turn: number; // 0: player1, 1: player2 ... 3: player4
    targetHP: number;
    maxHit: number;
    maxHitPlayer: string;
    lastHit: 0;
    lastHitPlayer: '';
}
