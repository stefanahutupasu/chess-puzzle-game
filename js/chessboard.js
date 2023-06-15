import { Piece } from './piece2.js';
import { BoardState } from './boardstate.js';
import { PuzzleMove } from './puzzlemove.js';

export class Chessboard {
    constructor(elementId, chessPuzzle) {
        this.boundHandleMouseup = this.handleMouseup.bind(this);
        this.boundGenerateHint = this.generateHint.bind(this);
        this.boardElement = document.getElementById(elementId);
        this.boardState = new BoardState(chessPuzzle.board, chessPuzzle.colors);
        this.pieces = [];
        this.populateBoard();
        document.addEventListener('mouseup', this.boundHandleMouseup);
        this.pieces.forEach(piece => {
            piece.registerObserver(this);
        });
        this.lastMove = null; // { piece: Piece, from: Square, to: Square }
        this.turn = chessPuzzle.turn;
        this.playerTurn = chessPuzzle.turn;
        this.whiteMoves = chessPuzzle.whiteMoves;
        this.blackMoves = chessPuzzle.blackMoves;
        this.mateInX = this.playerTurn === 'white' ? this.whiteMoves.length : this.blackMoves.length;
        this.displayTurn();
        this.promotionTime = false;
        document.getElementById('generate-hint').addEventListener('click', this.boundGenerateHint);
    }

    generateHint() {
        const moves = this.playerTurn === 'white' ? this.whiteMoves : this.blackMoves;
        //console.log(moves);
    
        if (moves.length === 0) {
            //console.log('No more moves available!');
            return;
        }
        
        const move = moves[0];
        const matchingPieces = this.pieces.filter(piece => piece.type === move.pieceType && piece.color === this.turn);
    
        let selectedPiece = null;
        const toSquare = { row: move.toRow + 1, col: move.toCol + 1 };
    
        for (let piece of matchingPieces) {
            if (piece.isValidMove(toSquare, this.boardState, this.lastMove)) {
                selectedPiece = piece;
                break;
            }
        }
    
        if (!selectedPiece) {
            //console.log("No valid piece found for move");
            return;
        }
    
        const row = parseInt(selectedPiece.element.parentElement.dataset.row);
        const col = parseInt(selectedPiece.element.parentElement.dataset.col);
        const squareElement = document.querySelector(`.square[data-row='${row}'][data-col='${col}']`);
        squareElement.classList.add('highlight');
    }
    
    checkIfCorrectMove(madeMove) {
        // Get the next move in the solution sequence based on the current turn
        const nextMove = this.turn === 'white' ? this.whiteMoves[0] : this.blackMoves[0];

        // Compare the made move with the next move in the solution
        return madeMove.pieceType === nextMove.pieceType &&
            madeMove.toRow === nextMove.toRow &&
            madeMove.toCol === nextMove.toCol;
    }

    displayTurn() {
        let turnElement = document.getElementById('turn-display');
        if (!turnElement) {
            turnElement = document.createElement('h1');
            turnElement.id = 'turn-display';
            document.body.appendChild(turnElement);
        }
        if(this.turn == 'white') {
            turnElement.setAttribute("style", "color: #D6FFF6"); // color for white
        } else {
            turnElement.setAttribute("style", "color: #231651"); // color for black
        }
        if(!this.promotionTime)
        turnElement.innerHTML = `Mate in ${this.mateInX}: ${this.turn} to move.`;
        else turnElement.innerHTML = `Promote your pawn.`;
    }

    incrementScore() {
        let scoreElement = document.getElementById('score');
        let currentScore = parseInt(scoreElement.textContent.split(": ")[1]);
        currentScore++;
        localStorage.setItem('score', currentScore);
        scoreElement.textContent = `Score: ${currentScore}`;
    }

    displayPuzzleComplete() {
        let turnElement = document.getElementById('turn-display');
        if (!turnElement) {
            turnElement = document.createElement('h1');
            turnElement.id = 'turn-display';
            document.body.appendChild(turnElement);
        }
        if(this.turn == 'white') {
            turnElement.setAttribute("style", "color: #231651"); // color for white
        } else {
            turnElement.setAttribute("style", "color: #D6FFF6"); // color for black
        }
        
        turnElement.innerHTML = `Puzzle complete!`;
        let sound = document.getElementById('puzzle_complete_sound');
        sound.play();
        document.getElementById('sparkles-left').style.display = 'block';
        document.getElementById('sparkles-right').style.display = 'block';
        this.incrementScore();
    }

    switchTurn() {
        if(!this.promotionTime)
        this.turn = this.turn === 'white' ? 'black' : 'white';
        this.displayTurn();
        if (this.turn !== this.playerTurn) {
            this.performComputerMove();
        }
    }

    performComputerMove() {
        const moves = this.turn === 'white' ? this.whiteMoves : this.blackMoves;
  
        if (moves.length === 0) {
          console.log('Puzzle completed!');
          this.displayPuzzleComplete();
          return;
        }
        
        const move = moves[0];
        const matchingPieces = this.pieces.filter(piece => piece.type === move.pieceType && piece.color === this.turn);
        //console.log(matchingPieces);
        //console.log(move);
        let selectedPiece = null;

        const toSquare = { row: move.toRow + 1, col: move.toCol + 1 };

        for (let piece of matchingPieces) {
            if (piece.isValidMove(toSquare, this.boardState, this.lastMove)) {
                selectedPiece = piece;
                break;
            }
            //console.log(piece.isValidMove(toSquare, this.boardState, this.lastMove));
        }

        if (!selectedPiece) {
            //console.log("No valid piece found for move");
            return;
        }

        let targetPiece = this.pieces.find(piece => {
            const pieceSquare = {row: parseInt(piece.element.parentElement.dataset.row), col: parseInt(piece.element.parentElement.dataset.col)};
            return pieceSquare.row === toSquare.row && pieceSquare.col === toSquare.col && piece.color !== this.turn;
        });
        if (targetPiece) {
            //console.log('captured!!');
            targetPiece.element.parentElement.removeChild(targetPiece.element);
            this.pieces = this.pieces.filter(piece => piece !== targetPiece);
        }
    
        const target = document.querySelector(`.square[data-row="${toSquare.row}"][data-col="${toSquare.col}"]`);
        const fromSquare = {row: parseInt(selectedPiece.element.parentElement.dataset.row), col: parseInt(selectedPiece.element.parentElement.dataset.col)};
        //console.log(target);
        target.appendChild(selectedPiece.element);
        let sound = document.getElementById('click_sound');
        sound.play();
    
        selectedPiece.square = target;
    
        if (this.turn === 'white') {
            this.whiteMoves.shift();
        } else {
            this.blackMoves.shift();
        }
    
        this.update(selectedPiece, fromSquare ,toSquare);
        this.switchTurn();
    }
    
    update(piece, fromSquare, toSquare) {
        const fromRow = parseInt(fromSquare.row);
        const fromCol = parseInt(fromSquare.col);
        const toRow = parseInt(toSquare.row);
        const toCol = parseInt(toSquare.col);
    
        if (fromRow === toRow && fromCol === toCol) {
            return;
        }
    
        console.log(`The ${piece.color} ${piece.type} has moved from square ${fromSquare.row},${fromSquare.col} to ${toSquare.row},${toSquare.col}`);
        this.lastMove = { piece, from: fromSquare, to: toSquare };
        this.boardState.movePiece(fromRow - 1, fromCol - 1, toRow - 1, toCol - 1);
    }
    
    populateBoard() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const pieceName = this.boardState.getPieceAt(row, col);
                let piece = null;
                if (pieceName !== 'empty') {
                    const color = this.boardState.getColorAt(row, col);
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
        if(this.boardElement.id == 'chessboard-empty')
            square.classList.add('square-fake', (row + col) % 2 === 0 ? 'light' : 'dark');
        else
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
        if (selectedPiece && selectedPiece.color === this.turn) {
            const toSquare = { row: parseInt(target.dataset.row), col: parseInt(target.dataset.col) };

            if (!this.isMoveSafe(selectedPiece, toSquare, this.turn)) {
                console.log("This move puts the king in check");
                return;
            }
            
            if (selectedPiece.isValidMove(toSquare, this.boardState, this.lastMove))  {
                const madeMove = new PuzzleMove(
                    selectedPiece.type,
                    toSquare.row - 1,
                    toSquare.col - 1,
                    '',
                    '', 
                    '', 
                    '', 
                    ''

                );
            
                // Check if the made move matches the next move in the solution
                if (!this.checkIfCorrectMove(madeMove)) {
                    console.log("Incorrect move");
                    //console.log(madeMove);
                
                    var modal = document.getElementById('modal');
                
                    modal.style.display = "block";
                    setTimeout(function() {
                        modal.style.opacity = "1";
                    }, 1); 
                
                    setTimeout(function() {
                        modal.style.opacity = "0";
                        setTimeout(function() {
                            modal.style.display = "none";
                        }, 700);
                    }, 1200);
                    return;
                }
                

                let targetPiece = this.pieces.find(piece => {
                    const pieceSquare = {row: parseInt(piece.element.parentElement.dataset.row), col: parseInt(piece.element.parentElement.dataset.col)};
                    return pieceSquare.row === toSquare.row && pieceSquare.col === toSquare.col && piece.color !== selectedPiece.color;
                });
              
                if (!targetPiece && this.lastMove && Math.abs(this.lastMove.from.row - this.lastMove.to.row) === 2 &&
                this.lastMove.piece.type === 'pawn' && this.lastMove.piece.color !== selectedPiece.color &&
                toSquare.col == this.lastMove.to.col && 
                Math.abs(toSquare.row - this.lastMove.to.row) === 1 && selectedPiece.fromSquare.row == this.lastMove.to.row) {
                //console.log("en passant happened");
                
                targetPiece = this.lastMove.piece;
                targetPiece.element.parentElement.removeChild(targetPiece.element);
                this.pieces = this.pieces.filter(piece => piece !== targetPiece);
                }
    
                else if (targetPiece) {
                    targetPiece.element.parentElement.removeChild(targetPiece.element);
                    this.pieces = this.pieces.filter(piece => piece !== targetPiece);
                }
                
                target.appendChild(selectedPiece.element);
                selectedPiece.square = target;
                if (selectedPiece.type === 'pawn') {
                    if ((selectedPiece.color === 'white' && toSquare.row === 1) || (selectedPiece.color === 'black' && toSquare.row === 8)) {
                        this.handlePromotion(selectedPiece);
                        //console.log("promotion time");
                    }
                }
                
                console.log("Correct move");
                console.log(madeMove);
                
                if (this.turn === 'white') {
                    this.whiteMoves.shift();
                } else {
                    this.blackMoves.shift();
                }

                setTimeout(() => {
                    this.switchTurn();
                }, 1000);
            }   
        }
    }

    getKing(color) {
        return this.pieces.find(piece => piece.type === 'king' && piece.color === color);
    }

    cloneState() {
        return this.boardState.clone();
    }
    
    applyMoveToState(piece, fromSquare, toSquare, clonedState) {
        
        let clonedPieces = [...this.pieces];
        const fromRow = parseInt(fromSquare.row) - 1;
        const fromCol = parseInt(fromSquare.col) - 1;
        const toRow = parseInt(toSquare.row) - 1;
        const toCol = parseInt(toSquare.col) - 1;
        
        if(clonedState.getPieceAt(fromRow, fromCol) !== 'empty') {
            const capturedPieceIndex = clonedPieces.findIndex(p => p.type === clonedState.getPieceAt(toRow,toCol) 
                && p.color !== piece.color && p.element.parentElement.dataset.row == toSquare.row && p.element.parentElement.dataset.col == toSquare.col);
            if (capturedPieceIndex > -1) {
                const capturedPiece = clonedPieces[capturedPieceIndex];
                //console.log(`A ${capturedPiece.color} ${capturedPiece.type} would be captured virtually.`);
                clonedPieces.splice(capturedPieceIndex, 1);
            }
        }
        
        else if (
            piece.type === 'pawn' &&
            this.lastMove &&
            this.lastMove.piece.type === 'pawn' &&
            this.lastMove.piece.color !== piece.color &&
            Math.abs(this.lastMove.from.row - this.lastMove.to.row) === 2 &&
            this.lastMove.to.row == fromRow + 1 &&
            this.lastMove.to.col - 1 == toCol
        ) {
            const capturedPieceIndex = clonedPieces.findIndex(p => p.type === 'pawn' && p.color !== piece.color && p.fromSquare === this.lastMove.to);
            if (capturedPieceIndex > -1) {
                clonedPieces.splice(capturedPieceIndex, 1);
            }
        }
    
        clonedState.movePiece(fromRow, fromCol, toRow, toCol);
        return { clonedState, clonedPieces };
    }
    
    isSquareAttacked(square, color, state) {
        //console.log(state.clonedPieces);
        const opponentColor = color === 'white' ? 'black' : 'white';
        const opponentPieces = state.clonedPieces.filter(piece => piece.color === opponentColor);
        for (let i = 0; i < opponentPieces.length; i++) {
            if (opponentPieces[i].isValidMove(square, state.clonedState, this.lastMove)) {
                console.log(`King is attacked by ${opponentPieces[i].color} ${opponentPieces[i].type}`);
                return true;
            }
        }
        return false;
    }
    
    isMoveSafe(selectedPiece, toSquare, turn) {
        let clonedState = this.cloneState();
    
        let clonedStateAndPieces = this.applyMoveToState(selectedPiece, selectedPiece.fromSquare, toSquare, clonedState);
    
        const king = this.getKing(turn);
    
        const kingSquare = { row: parseInt(king.element.parentElement.dataset.row), col: parseInt(king.element.parentElement.dataset.col) };
    
        // If the move puts the king in check, or if the moving piece is the king and the destination is attacked, the move isn't safe
        if (selectedPiece.type === 'king') {
            return !this.isSquareAttacked(toSquare, turn, clonedStateAndPieces);
        } else {
            return !this.isSquareAttacked(kingSquare, turn, clonedStateAndPieces);
        }
    }
    
    handlePromotion(pawn) {
        // Create the popup
        this.promotionTime = true;
        const promotionPopup = document.createElement('div');
        promotionPopup.className = 'promotion-popup';
        // Create buttons for each piece
        const pieces = ['queen', 'rook', 'bishop', 'knight'];
        pieces.forEach(piece => {
            const button = document.createElement('button');
            button.classList.add("promotion-button");
            const pieceImg = document.createElement('img');
            pieceImg.src = `img/${piece}.png`; 
            pieceImg.alt = piece;
            pieceImg.className = 'piece';
            pieceImg.classList.add(pawn.color);
            
            button.appendChild(pieceImg);
            button.addEventListener('click', () => {
                this.promotePawn(pawn, piece);
                promotionPopup.remove();
                this.promotionTime = false;
                this.switchTurn();
            });
            promotionPopup.appendChild(button);
        });
    
        this.boardElement.parentNode.appendChild(promotionPopup);
    }
    
    promotePawn(pawn, piece) {
        pawn.type = piece;
        pawn.element.src = `img/${piece}.png`;
        pawn.setMoveStrategy(pawn.type);
    }
    
    cleanup() {
        document.removeEventListener('mouseup', this.boundHandleMouseup);
        document.getElementById('generate-hint').removeEventListener('click', this.boundGenerateHint);
    }
}