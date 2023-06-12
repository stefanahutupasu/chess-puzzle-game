import { PuzzleMove } from './puzzlemove.js';

export function parseMoveStrings(moveString) {
    // Split the string by spaces
     let moves = moveString.split(' ');
   
     
     console.log(moves);
     // Filter out move numbers (e.g. "1." or "2...")
     moves = moves.filter(move => !move.includes('.') && !move=='');

     // Initialize empty arrays to hold the moves
     let whiteMoves = [];
     let blackMoves = [];

     // If the first move is by black, adjust the arrays accordingly
     if (moveString.startsWith('1...')) {
         blackMoves.push(moves[0]);
         moves = moves.slice(1);
     }

     // Group the rest of the moves into pairs
     for (let i = 0; i < moves.length; i += 2) {
         whiteMoves.push(moves[i]);
         if (moves[i + 1]) {
             blackMoves.push(moves[i + 1]);
         }
     }

     return {
         whiteMoves,
         blackMoves
     };
 }
 
export function parseAlgebraicNotation(moveString) {
     // A mapping from algebraic notation to array indices
     const fileMapping = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7 };
 
     // Regular expression to match a move in algebraic notation (simplified)
     const moveRegex = /^([RNBQK]?)([a-h]?)([1-8]?)([x-]?)([a-h])([1-8])([+#]?)([e.p.q.r.n.b.q.k]?)/;
     
     const match = moveString.match(moveRegex);
 
     if (!match) {
        console.log(moveString);
         throw new Error('Invalid move string');
     }
 
     const pieceType = match[1] || 'P';  // Pawn moves do not include the piece type
     const disambiguator = match[2];
     const rankDisambiguator = match[3];
     const capture = match[4];
     const toFile = match[5];
     const toRank = match[6];
     const checkOrMate = match[7];
     const promotion = match[8];
 
     // Convert alphanumeric grid reference to array indices
     const toRow = 8 - toRank;  // Subtract from 8 because chess ranks count from 1 at the bottom of the board
     const toCol = fileMapping[toFile];
 
     // The fromRow and fromCol cannot be determined from the move string alone - you would need the current game state to find which piece is able to move to the destination square. This could be achieved by iterating over the board to find a piece of the correct type and color that is able to make the specified move.
 
     // Handle special cases (castling, en passant, pawn promotion, checks, and checkmates)
 
     // For now, simply return the parsed information
     return new PuzzleMove(
         pieceType,
         toRow,
         toCol,
         disambiguator,
         rankDisambiguator,
         capture,
         checkOrMate,
         promotion
     );
 }
 
export function translateMovesToPuzzleMoves(moveStrings) {
     const whiteMoveStrings = moveStrings.whiteMoves;
     const blackMoveStrings = moveStrings.blackMoves;
 
     const whiteMoves = whiteMoveStrings.map(moveString => parseAlgebraicNotation(moveString));
     const blackMoves = blackMoveStrings.map(moveString => parseAlgebraicNotation(moveString));
 
     return {
         whiteMoves,
         blackMoves
     };
 }

export function mapPieceTypeToFullNames(puzzleMoves) {
     // Mapping from algebraic notation to full English names
     const pieceTypeMapping = {
         'P': 'pawn',
         'R': 'rook',
         'N': 'knight',
         'B': 'bishop',
         'Q': 'queen',
         'K': 'king'
     };
 
     const mapPieceTypeInMove = move => {
         return new PuzzleMove(
             pieceTypeMapping[move.pieceType] || move.pieceType,
             move.toRow,
             move.toCol,
             move.disambiguator,
             move.rankDisambiguator,
             move.capture,
             move.checkOrMate,
             move.promotion
         );
     };
 
     const whiteMoves = puzzleMoves.whiteMoves.map(mapPieceTypeInMove);
     const blackMoves = puzzleMoves.blackMoves.map(mapPieceTypeInMove);
 
     return {
         whiteMoves,
         blackMoves
     };
 }
 

 export class Handler {
    constructor() {
        this.nextHandler = null;
    }

    setNext(handler) {
        this.nextHandler = handler;
        return handler;
    }

    handle(request) {
        if (this.nextHandler) {
            return this.nextHandler.handle(request);
        }
        return null;
    }
}

export class ParseMoveStringsHandler extends Handler {
    handle(request) {
        if (request.moveString) {
            const moveStrings = parseMoveStrings(request.moveString);
            if (this.nextHandler) {
                return this.nextHandler.handle({ ...request, moveStrings });
            }
            return { ...request, moveStrings };
        }
        return super.handle(request);
    }
}

export class TranslateMovesToPuzzleMovesHandler extends Handler {
    handle(request) {
        if (request.moveStrings) {
            const puzzleMoves = translateMovesToPuzzleMoves(request.moveStrings);
            if (this.nextHandler) {
                return this.nextHandler.handle({ ...request, puzzleMoves });
            }
            return { ...request, puzzleMoves };
        }
        return super.handle(request);
    }
}

export class MapPieceTypeToFullNamesHandler extends Handler {
    handle(request) {
        if (request.puzzleMoves) {
            const puzzleMovesWithFullNames = mapPieceTypeToFullNames(request.puzzleMoves);
            if (this.nextHandler) {
                return this.nextHandler.handle({ ...request, puzzleMovesWithFullNames });
            }
            return {puzzleMovesWithFullNames};

            
        }
        return super.handle(request);
    }
}

// Setup the chain
export const parseMoveStringsHandler = new ParseMoveStringsHandler();
export const translateMovesToPuzzleMovesHandler = new TranslateMovesToPuzzleMovesHandler();
export const mapPieceTypeToFullNamesHandler = new MapPieceTypeToFullNamesHandler();

parseMoveStringsHandler
    .setNext(translateMovesToPuzzleMovesHandler)
    .setNext(mapPieceTypeToFullNamesHandler);

// const string1 = "1... Kh6 2. c5 g5# ";
// const initialRequest = { moveString: string1 };

// const result = parseMoveStringsHandler.handle(initialRequest);
// const blackMoves = result.puzzleMovesWithFullNames.blackMoves;
// const whiteMoves = result.puzzleMovesWithFullNames.whiteMoves;
// console.log(whiteMoves);
// console.log(blackMoves);
