import { Piece } from './piece.js';

export class Chessboard {
    constructor(elementId, initialConfiguration) {
        this.boardElement = document.getElementById(elementId);
        this.initialConfiguration = initialConfiguration;
        this.pieces = [];
        this.populateBoard();
        document.addEventListener('mouseup', this.handleMouseup.bind(this));
    }

    populateBoard() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const pieceName = this.initialConfiguration[row][col];
                let piece = null;
                if (pieceName !== 'empty') {
                    const color = row < 2 ? 'black' : 'white';
                    piece = new Piece(pieceName, color, row, col);
                    this.pieces.push(piece);
                }
                const square = this.createSquare(row, col, piece ? piece.element : null);
                square.addEventListener('mouseup', this.handleSquareMouseup.bind(this));
                this.boardElement.appendChild(square);
            }
        }
    }

    createSquare(row, col, pieceElement) {
        const square = document.createElement('div');
        square.classList.add('square', (row + col) % 2 === 0 ? 'light' : 'dark');
        square.dataset.row = row + 1;
        square.dataset.col = col + 1;
        if (pieceElement) square.appendChild(pieceElement);
        return square;
    }

    handleMouseup() {
        this.pieces.forEach(piece => {
            piece.deselect();
        });
    }

    handleSquareMouseup(e) {
        e.preventDefault();
        const target = e.currentTarget;
        const selectedPiece = this.pieces.find(piece => piece.clone !== null);
        if (selectedPiece) {
            target.appendChild(selectedPiece.element);
            selectedPiece.square = target;
        }
    }
}

