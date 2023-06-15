// Piece.js
import { KnightMoveStrategy, PawnMoveStrategy, RookMoveStrategy, BishopMoveStrategy, QueenMoveStrategy, KingMoveStrategy } from './movement.js';

export class Piece {
    constructor(type, color, row, col) {
        this.type = type;
        this.color = color;
        this.square = null;
        this.setMoveStrategy(type);
    }

    setMoveStrategy(type) {
        switch (type) {
            case 'pawn':
                this.moveStrategy = new PawnMoveStrategy(this.color);
                break;
            case 'rook':
                this.moveStrategy = new RookMoveStrategy(this.color);
                break;
            case 'knight':
                this.moveStrategy = new KnightMoveStrategy(this.color);
                break;
            case 'bishop':
                this.moveStrategy = new BishopMoveStrategy(this.color);
                break;
            case 'queen':
                this.moveStrategy = new QueenMoveStrategy(this.color);
                break;
            case 'king':
                this.moveStrategy = new KingMoveStrategy(this.color);
                break;
            default:
                this.moveStrategy = new PawnMoveStrategy(this.color);
                break;
        }
    }

    isValidMove(toSquare, initialConfiguration, initialColors, lastMove) {
        const fromSquare = {row: parseInt(this.element.parentElement.dataset.row), col: parseInt(this.element.parentElement.dataset.col)};
        return this.moveStrategy.isValidMove(fromSquare, toSquare, initialConfiguration, initialColors, lastMove);
    }

    //... Other game-logic methods
}

