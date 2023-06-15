export class ChessboardMemento {
    constructor(pieces, boardElement) {
        // Make a deep copy of the pieces
        this.pieces = JSON.parse(JSON.stringify(pieces));
        // Clone the board DOM element
        this.boardElement = boardElement.cloneNode(true);
    }
}