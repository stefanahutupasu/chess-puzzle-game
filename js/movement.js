export class MoveStrategy {
    isValidMove(from, to, initialConfiguration, initialColors, lastMove) {
        throw new Error("This method must be overwritten!");
    }
}


export class PawnMoveStrategy extends MoveStrategy {
    constructor(pieceColor) {
        super();
        this.pieceColor = pieceColor;
    }

    isValidMove(from, to, initialConfiguration, initialColors, lastMove) {
        // For black pawn
        if (this.pieceColor === 'black') {
            // Capture
            if (Math.abs(from.col - to.col) === 1 && to.row === from.row + 1) {
                // Normal capture
                if (initialConfiguration[to.row - 1][to.col - 1] !== 'empty' && initialColors[to.row - 1][to.col - 1] != this.pieceColor) {
                    return true;
                }
                // En passant capture
                else if (
                    initialConfiguration[to.row - 1][to.col - 1] === 'empty' && 
                    lastMove && 
                    lastMove.piece.type === 'pawn' && 
                    lastMove.piece.color !== this.pieceColor &&
                    Math.abs(lastMove.from.row - lastMove.to.row) === 2 && 
                    lastMove.to.row == from.row && 
                    lastMove.to.col == to.col
                ) {
                    console.log("En passant condition met"); 
                    return true;
                }
            }
            // Forward move
            else if (from.col === to.col) {
                if (from.row === 2) {
                    return (to.row === from.row + 1 && initialConfiguration[from.row][from.col - 1] == 'empty') 
                    || (to.row === from.row + 2 && initialConfiguration[from.row][from.col - 1] == 'empty' && initialConfiguration[from.row + 1][from.col - 1] == 'empty');
                } else {
                    return to.row === from.row + 1 && initialConfiguration[from.row][from.col - 1] == 'empty';
                }
            }
        }
        // For white pawn
        else if (this.pieceColor === 'white') {
            // Capture
            if (Math.abs(from.col - to.col) === 1 && to.row === from.row - 1) {
                // Normal capture
                if (initialConfiguration[to.row - 1][to.col - 1] !== 'empty' && initialColors[to.row - 1][to.col - 1] != this.pieceColor) {
                    return true;
                }
                // En passant capture
                else if (
                    initialConfiguration[to.row - 1][to.col - 1] === 'empty' && 
                    lastMove && 
                    lastMove.piece.type === 'pawn' && 
                    lastMove.piece.color !== this.pieceColor &&
                    Math.abs(lastMove.from.row - lastMove.to.row) === 2 && 
                    lastMove.to.row == from.row && 
                    lastMove.to.col == to.col
                ) {
                    console.log("En passant condition met");  // Debug line
                    return true;
                }
                // else {
                //     console.log(initialConfiguration[to.row - 1][to.col - 1] === 'empty');
                //     console.log(lastMove);
                //     console.log(lastMove.piece.type === 'pawn');
                //     console.log(lastMove.piece.color !== this.pieceColor);
                //     console.log(Math.abs(lastMove.from.row - lastMove.to.row) === 2);
                //     console.log(lastMove.to.row == from.row);
                //     console.log(lastMove.to.col == to.col);
                // }
            }
            // Forward move
            else if (from.col === to.col) {
                if (from.row === 7) {
                    return (to.row === from.row - 1 && initialConfiguration[from.row - 2][from.col - 1] === 'empty') 
                    || (to.row === from.row - 2  && initialConfiguration[from.row - 2][from.col - 1] === 'empty' && initialConfiguration[from.row - 3][from.col - 1] === 'empty');
                } else {
                    return to.row === from.row - 1 && initialConfiguration[from.row - 2][from.col - 1] === 'empty';
                }
            }
        }
        return false;
    }
    
}



export class RookMoveStrategy extends MoveStrategy {
    constructor(pieceColor) {
        super();
        this.pieceColor = pieceColor;
    }

    isValidMove(from, to, initialConfiguration, initialColors, lastMove) {
        // The rook can move in any direction along its rank or file, 
        // so the move is valid if the target square is in the same row or column
        if (from.row === to.row || from.col === to.col) {
            const rowStep = from.row < to.row ? 1 : from.row > to.row ? -1 : 0;
            const colStep = from.col < to.col ? 1 : from.col > to.col ? -1 : 0;

            let currentRow = from.row + rowStep;
            let currentCol = from.col + colStep;

            // Check all squares along the move path for pieces in the way
            while (currentRow !== to.row || currentCol !== to.col) {
                if (initialConfiguration[currentRow - 1][currentCol - 1] !== 'empty') {
                    return false;  // If there's a piece in the way, the move is invalid
                }
                currentRow += rowStep;
                currentCol += colStep;
            }

            // If the target square is occupied by a piece of the same color, the move is invalid
            if (initialConfiguration[to.row - 1][to.col - 1] !== 'empty' && initialColors[to.row - 1][to.col - 1] === this.pieceColor) {
                return false;
            }

            // If we've gotten this far, the move is valid
            return true;
        }

        // If the target square is not in the same row or column, the move is invalid
        return false;
    }
}

export class KnightMoveStrategy extends MoveStrategy {
    constructor(pieceColor) {
        super();
        this.pieceColor = pieceColor;
    }

    isValidMove(from, to, initialConfiguration, initialColors, lastMove) {
        // The knight moves in an 'L' shape: 2 squares in one direction, then 1 square perpendicular
        const rowDiff = Math.abs(from.row - to.row);
        const colDiff = Math.abs(from.col - to.col);

        if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
            return false;  // If the move is not in an 'L' shape, it's invalid
        }

        // If the target square is occupied by a piece of the same color, the move is invalid
        if (initialConfiguration[to.row - 1][to.col - 1] !== 'empty' && initialColors[to.row - 1][to.col - 1] === this.pieceColor) {
            return false;
        }

        // If we've gotten this far, the move is valid
        return true;
    }
}


export class BishopMoveStrategy extends MoveStrategy {
    constructor(pieceColor) {
        super();
        this.pieceColor = pieceColor;
    }

    isValidMove(from, to, initialConfiguration, initialColors, lastMove) {
        // The bishop can move in any direction diagonally, 
        // so the move is valid if the absolute difference in row and column is the same
        if (Math.abs(from.row - to.row) !== Math.abs(from.col - to.col)) {
            return false;
        }

        const rowDirection = from.row < to.row ? 1 : -1;
        const colDirection = from.col < to.col ? 1 : -1;

        let currentRow = from.row + rowDirection;
        let currentCol = from.col + colDirection;

        // Check all squares along the move path for pieces in the way
        while (currentRow !== to.row || currentCol !== to.col) {
            if (currentRow < 1 || currentRow > 8 || currentCol < 1 || currentCol > 8) {
                break; // Out of bounds, so the move is invalid
            }
        
            if (initialConfiguration[currentRow - 1][currentCol - 1] !== 'empty') {
                return false;  // If there's a piece in the way, the move is invalid
            }
        
            currentRow += rowDirection;
            currentCol += colDirection;
        }

        // If the target square is occupied by a piece of the same color, the move is invalid
        if (initialConfiguration[to.row - 1][to.col - 1] !== 'empty' && initialColors[to.row - 1][to.col - 1] === this.pieceColor) {
            return false;
        }

        // If we've gotten this far, the move is valid
        return true;
    }
}

export class QueenMoveStrategy extends MoveStrategy {
    constructor(pieceColor) {
        super();
        this.pieceColor = pieceColor;
        this.rookStrategy = new RookMoveStrategy(pieceColor);
        this.bishopStrategy = new BishopMoveStrategy(pieceColor);
    }

    isValidMove(from, to, initialConfiguration, initialColors, lastMove) {
        // A queen can move either like a rook or a bishop
        // So, we can reuse the logic from those pieces.
        return this.rookStrategy.isValidMove(from, to, initialConfiguration, initialColors, lastMove)
            || this.bishopStrategy.isValidMove(from, to, initialConfiguration, initialColors, lastMove);
    }
}


export class KingMoveStrategy extends MoveStrategy {
    constructor(pieceColor) {
        super();
        this.pieceColor = pieceColor;
    }

    isValidMove(from, to, initialConfiguration, initialColors, lastMove) {
        // The king can move one square in any direction: horizontally, vertically, or diagonally.
        const rowDiff = Math.abs(from.row - to.row);
        const colDiff = Math.abs(from.col - to.col);

        if (rowDiff > 1 || colDiff > 1) {
            return false;  // If the move is more than one square in any direction, it's invalid
        }

        // If the target square is occupied by a piece of the same color, the move is invalid
        if (initialConfiguration[to.row - 1][to.col - 1] !== 'empty' && initialColors[to.row - 1][to.col - 1] === this.pieceColor) {
            return false;
        }

        // If we've gotten this far, the move is valid
        return true;
    }
}
