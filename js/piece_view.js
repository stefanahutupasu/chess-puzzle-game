import { Piece } from './piece.js';

export class PieceView {
    constructor(piece) {
        this.piece = piece;
        this.element = this.createElement();
    }

    createElement() {
        const element = document.createElement('img');
        element.src = `img/${this.piece.type}.png`; // Replace with the actual path to the image
        element.alt = this.piece.type;
        element.classList.add('piece');
        element.classList.add(this.piece.color);
        return element;
    }

}