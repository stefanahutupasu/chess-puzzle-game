export class PuzzleMove {
    constructor(pieceType, toRow, toCol, disambiguator, rankDisambiguator, capture, checkOrMate, promotion) {
        this.pieceType = pieceType;
        this.toRow = toRow;
        this.toCol = toCol;
        this.disambiguator = disambiguator;
        this.rankDisambiguator = rankDisambiguator;
        this.capture = capture;
        this.checkOrMate = checkOrMate;
        this.promotion = promotion;
    }
}