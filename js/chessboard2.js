import { Piece } from './piece2.js';

export class Chessboard {
    constructor(elementId, initialConfiguration, initialColors, initialTurn) {
        this.boardElement = document.getElementById(elementId);
        this.initialConfiguration = initialConfiguration;
        this.initialColors = initialColors;
        this.pieces = [];
        this.populateBoard();
        document.addEventListener('mouseup', this.handleMouseup.bind(this));
        this.pieces.forEach(piece => {
            piece.registerObserver(this);
        });
        this.lastMove = null; // { piece: Piece, from: Square, to: Square }
        this.turn = initialTurn;

        this.displayTurn();
        this.promotionTime = false;

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
        turnElement.innerHTML = `It's ${this.turn}'s turn.`;
        else turnElement.innerHTML = `Promote your pawn.`;
    }

    switchTurn() {
        if(!this.promotionTime)
        this.turn = this.turn === 'white' ? 'black' : 'white';

        
        this.displayTurn();
    }

    update(piece, fromSquare, toSquare) {
        // Parse the coordinates as integers
        const fromRow = parseInt(fromSquare.row);
        const fromCol = parseInt(fromSquare.col);
        const toRow = parseInt(toSquare.row);
        const toCol = parseInt(toSquare.col);
    
        // If fromSquare and toSquare are the same, don't do anything
        if (fromRow === toRow && fromCol === toCol) {
            return;
        }
    
        console.log(`The ${piece.color} ${piece.type} has moved from square ${fromSquare.row},${fromSquare.col} to ${toSquare.row},${toSquare.col}`);
        this.lastMove = { piece, from: fromSquare, to: toSquare };
        console.log(this.lastMove);

        // Update the pieces matrix
        this.initialConfiguration[fromRow - 1][fromCol - 1] = 'empty';
        this.initialConfiguration[toRow - 1][toCol - 1] = piece.type;
    
        // Update the colors matrix
        this.initialColors[fromRow - 1][fromCol - 1] = 'empty';
        this.initialColors[toRow - 1][toCol - 1] = piece.color;
    }
    


    populateBoard() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const pieceName = this.initialConfiguration[row][col];
                let piece = null;
                if (pieceName !== 'empty') {
                    //const color = row < 2 ? 'black' : 'white';
                    const color = this.initialColors[row][col];
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
            


        
            if (selectedPiece.isValidMove(toSquare, this.initialConfiguration, this.initialColors, this.lastMove))  {
                
                let targetPiece = this.pieces.find(piece => {
                    const pieceSquare = {row: parseInt(piece.element.parentElement.dataset.row), col: parseInt(piece.element.parentElement.dataset.col)};
                    return pieceSquare.row === toSquare.row && pieceSquare.col === toSquare.col && piece.color !== selectedPiece.color;
                });
              
                if (!targetPiece && this.lastMove && Math.abs(this.lastMove.from.row - this.lastMove.to.row) === 2 &&
                this.lastMove.piece.type === 'pawn' && this.lastMove.piece.color !== selectedPiece.color &&
                toSquare.col == this.lastMove.to.col && 
                Math.abs(toSquare.row - this.lastMove.to.row) === 1 && selectedPiece.fromSquare.row == this.lastMove.to.row) {
                console.log("en passant happened");
                // The piece to be removed is the last moved piece
                targetPiece = this.lastMove.piece;
                // Remove the captured piece from the board
                targetPiece.element.parentElement.removeChild(targetPiece.element);
                // Remove the captured piece from the pieces array
                this.pieces = this.pieces.filter(piece => piece !== targetPiece);
                }
    
                else if (targetPiece) {
                    // Remove the captured piece from the board
                    targetPiece.element.parentElement.removeChild(targetPiece.element);
                    // Remove the captured piece from the pieces array
                    this.pieces = this.pieces.filter(piece => piece !== targetPiece);
                }
                target.appendChild(selectedPiece.element);
                selectedPiece.square = target;
                if (selectedPiece.type === 'pawn') {
                    if ((selectedPiece.color === 'white' && toSquare.row === 1) || (selectedPiece.color === 'black' && toSquare.row === 8)) {
                        this.handlePromotion(selectedPiece);

                        // let turnElement = document.getElementById('turn-display');
                        // turnElement.textContent = "Promote your pawn.";
                        // // Change the color based on the color of the pawn
                        // if(selectedPiece.color == 'white') {
                        //     turnElement.style.color = "#D6FFF6"; // color for white
                        // } else {
                        //     turnElement.style.color = "#231651"; // color for black
                        // }
                        console.log("promotion time");
                    }
            }

            this.switchTurn();
        }
    }
    }

    getKing(color) {
        return this.pieces.find(piece => piece.type === 'king' && piece.color === color);
    }
    
    cloneState() {
        // Using map() with the spread operator to create a deep copy of the 2D arrays
        const clonedConfig = this.initialConfiguration.map(row => [...row]);
        const clonedColors = this.initialColors.map(row => [...row]);
        return { clonedConfig, clonedColors };
    }
    
    applyMoveToState(piece, fromSquare, toSquare, clonedState) {
        const { clonedConfig, clonedColors } = clonedState;
        let clonedPieces = [...this.pieces];
        const fromRow = parseInt(fromSquare.row) - 1;
        const fromCol = parseInt(fromSquare.col) - 1;
        const toRow = parseInt(toSquare.row) - 1;
        const toCol = parseInt(toSquare.col) - 1;
        
        // Check for normal capture
        if (clonedConfig[toRow][toCol] !== 'empty') {
            const capturedPieceIndex = clonedPieces.findIndex(p => p.type === clonedConfig[toRow][toCol] && p.color !== piece.color && p.element.parentElement.dataset.row == toSquare.row && p.element.parentElement.dataset.col == toSquare.col);
            if (capturedPieceIndex > -1) {
                const capturedPiece = clonedPieces[capturedPieceIndex];
                console.log(`A ${capturedPiece.color} ${capturedPiece.type} would be captured virtually.`);
                clonedPieces.splice(capturedPieceIndex, 1);
                clonedConfig[toRow][toCol] = 'empty';
                clonedColors[toRow][toCol] = 'empty';
            }
        }
        
        // Check for en passant capture
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
    
        clonedConfig[fromRow][fromCol] = 'empty';
        clonedConfig[toRow][toCol] = piece.type;
        clonedColors[fromRow][fromCol] = 'empty';
        clonedColors[toRow][toCol] = piece.color;
       // console.log(clonedPieces);
        return { clonedConfig, clonedColors, clonedPieces };
    }
    
    isSquareAttacked(square, color, state) {
        console.log(state.clonedPieces);
        const opponentColor = color === 'white' ? 'black' : 'white';
        const opponentPieces = state.clonedPieces.filter(piece => piece.color === opponentColor);
        for (let i = 0; i < opponentPieces.length; i++) {
            if (opponentPieces[i].isValidMove(square, state.clonedConfig, state.clonedColors, this.lastMove)) {
                console.log(`King is attacked by ${opponentPieces[i].color} ${opponentPieces[i].type}`);
                return true;
            }
        }
        return false;
    }
    
    isMoveSafe(selectedPiece, toSquare, turn) {
        // Create a copy of the current game state
        let clonedState = this.cloneState();
    
        // Apply the move to the copied game state
        clonedState = this.applyMoveToState(selectedPiece, selectedPiece.fromSquare, toSquare, clonedState);
    
        // Get the king
        const king = this.getKing(turn);
    
        // Get the king's square
        const kingSquare = { row: parseInt(king.element.parentElement.dataset.row), col: parseInt(king.element.parentElement.dataset.col) };
    
        // If the move puts the king in check, or if the moving piece is the king and the destination is attacked, the move isn't safe
        if (selectedPiece.type === 'king') {
            return !this.isSquareAttacked(toSquare, turn, clonedState);
        } else {
            return !this.isSquareAttacked(kingSquare, turn, clonedState);
        }
    }
    
    

    handlePromotion(pawn) {
        // Create the popup
        this.promotionTime = true;
        const promotionPopup = document.createElement('div');
        promotionPopup.className = 'promotion-popup';
        //promotionPopup.appendChild(new Text("promote"));
    
        // Create buttons for each piece
        const pieces = ['queen', 'rook', 'bishop', 'knight'];
        pieces.forEach(piece => {
            const button = document.createElement('button');
            button.classList.add("promotion-button");
            // if(pawn.color == "black")
            // button.classList.add("light");
            // Create an img element for the piece
            const pieceImg = document.createElement('img');
            pieceImg.src = `img/${piece}.png`; // Replace with the actual path to the image
            pieceImg.alt = piece;
            pieceImg.className = 'piece';
            pieceImg.classList.add(pawn.color);
            
            // Append the img to the button
            button.appendChild(pieceImg);
            
            button.addEventListener('click', () => {
                this.promotePawn(pawn, piece);
                promotionPopup.remove();
                this.promotionTime = false;
                this.switchTurn();
            });
            promotionPopup.appendChild(button);
        });
    
        // Append the popup to the board
        this.boardElement.parentNode.appendChild(promotionPopup);
    }
    
    
    
    promotePawn(pawn, piece) {
        // Replace the pawn with the chosen piece
        pawn.type = piece;
        // Update the pawn's image based on its new type
        pawn.element.src = `img/${piece}.png`;
        
        pawn.setMoveStrategy(pawn.type);
        //console.log(pawn);
    }
    



}