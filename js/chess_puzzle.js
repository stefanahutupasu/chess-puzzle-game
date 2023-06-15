export class ChessPuzzle {
    constructor(board, colors, turn, blackMoves, whiteMoves, metadata) {
        this.board = board;
        this.colors = colors;
        this.turn = turn;
        this.blackMoves = blackMoves;
        this.whiteMoves = whiteMoves;
        this.metadata = metadata;
        this.isCompleted = false;
    }

    complete() {
        this.isCompleted = true;
    }
}
