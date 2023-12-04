export interface Game {
    players: string[];
    turn: number; // 0: player1, 1: player2 ... 3: player4
    targetHP: number;
    maxHit: number;
    maxHitPlayer: string;
}

export interface GameDto {
    currentPlayer: string;
    targetHP: number;
    maxHit: number;
    maxHitPlayer: string;
}
