import { KnightMoveStrategy, PawnMoveStrategy, RookMoveStrategy, BishopMoveStrategy, QueenMoveStrategy, KingMoveStrategy } from './movement.js';

export class Piece {
    constructor(type, color, row, col) {
        this.type = type;
        this.color = color;
        this.clone = null;
        this.square = null;
        this.fromSquare = null;
        this.invisible = false;
        const img = document.createElement('img');
        img.draggable = false;
        img.src = `img/${type}.png`;
        img.id = `${type}-${row}-${col}`;  
        img.classList.add('piece', color);
        img.addEventListener('mousedown', this.handleMousedown.bind(this));
        document.addEventListener('mousemove', this.handleMousemove.bind(this));
        this.element = img;

        this.observers = []; 

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

    isValidMove(toSquare, boardState, lastMove) {
        const fromSquare = {row: parseInt(this.element.parentElement.dataset.row), col: parseInt(this.element.parentElement.dataset.col)};
        return this.moveStrategy.isValidMove(fromSquare, toSquare, boardState.configuration, boardState.colors, lastMove);
    }
    



    registerObserver(observer) {
        this.observers.push(observer);
    }

    notifyObservers(fromSquare, toSquare) {
        for (let observer of this.observers) {
            observer.update(this, fromSquare, toSquare);
        }
    }

    handleMousedown(e) {
        e.preventDefault();
        this.clone = this.element.cloneNode(true);
        this.clone.style.position = "fixed";
        this.clone.style.pointerEvents = "none";
        this.clone.id = 'clone';
        document.body.appendChild(this.clone);
        this.square = this.element.parentElement;
        this.element.classList.add('invisible');
        this.moveClone(e);
    
        this.fromSquare = this.element.parentElement.dataset;
        
        // Calculate possible moves and highlight squares
        let sound = document.getElementById('click_sound');
        sound.play();
        this.highlightPossibleMoves();
    }
    
    highlightPossibleMoves() {
        // Clear previous highlights
        this.clearHighlights();
    
        // Calculate and highlight all possible moves
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 8; col++) {
                const toSquare = { row: row, col: col };
                if (this.isValidMove(toSquare, this.observers[0].boardState, this.observers[0].lastMove)
                && this.observers[0].isMoveSafe(this, toSquare, this.color)) {
               
                    const squareElement = document.querySelector(`.square[data-row='${row}'][data-col='${col}']`);
                    squareElement.classList.add('highlight');
                }
            }
        }
    }
    
    clearHighlights() {
        
        const squares = document.getElementsByClassName('square');
        for (let i = 0; i < squares.length; i++) {
            squares[i].classList.remove('highlight');
        }
    }
    

    handleMousemove(e) {
        if (!this.clone) return;
        this.moveClone(e);
    }

    moveClone(e) {
        this.clone.style.left = (e.clientX - this.clone.offsetWidth / 2) + 'px';
        this.clone.style.top = (e.clientY - this.clone.offsetHeight / 2) + 'px';
    }

    deselect() {
        if (!this.element || !this.clone) return;

        const toSquare = this.element.parentElement.dataset;
        this.element.style.position = 'static';
        document.body.removeChild(this.clone);
        this.clone = null;

        if (this.fromSquare) {
            this.notifyObservers(this.fromSquare, toSquare);
            this.fromSquare = null; // Reset the fromSquare data
        }

        this.square = null;
        this.element.classList.remove('invisible');
        this.clearHighlights();
    }
    
    
}
