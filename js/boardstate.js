export class BoardState {
    constructor(initialConfiguration, initialColors) {
        this.configuration = initialConfiguration;
        this.colors = initialColors;
    }

    getPieceAt(row, col) {
        return this.configuration[row][col];
    }

    getColorAt(row, col) {
        return this.colors[row][col];
    }

    emptySquare(row, col) {
        this.configuration[row][col] = 'empty';
        this.colors[row][col] = 'empty';
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        //console.log('coords', fromRow, fromCol, toRow, toCol);
        this.configuration[toRow][toCol] = this.configuration[fromRow][fromCol];
        this.colors[toRow][toCol] = this.colors[fromRow][fromCol];
        this.emptySquare(fromRow, fromCol);
    }

    clone() {
        const clonedConfiguration = this.configuration.map(row => [...row]);
        const clonedColors = this.colors.map(row => [...row]);
        return new BoardState(clonedConfiguration, clonedColors);
    }
}
