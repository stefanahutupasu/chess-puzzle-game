import { Chessboard } from './chessboard2.js';




    async function getRandomPuzzle() {
        const response = await fetch('puzzles.txt', {
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        const data = await response.text();
        console.log(data);
        const puzzles = data.split(/\r?\n\r?\n\r?\n/);
        console.log(puzzles);
        const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];

        const lines = randomPuzzle.split('\n');
        const metadata = lines[0];  // Extract the first line
        const fen = lines[1];  // Extract the second line

        return { metadata, fen };
    }

    function displayPuzzleInfo(info) {
        let infoElement = document.getElementById('info-display');
        if (!infoElement) {
            infoElement = document.createElement('h1');
            infoElement.id = 'info-display';
            document.body.appendChild(infoElement);
        }
        infoElement.innerHTML = info;
    }
    

    
    // async function getFENFromPuzzle() {
    //     const randomPuzzle = await getRandomPuzzle();
    //     const puzzleLines = randomPuzzle.fen;
    //     const FENLine = puzzleLines.find(line => line.includes('w - -') || line.includes('b - -'));
    
    //     return FENLine;
    // }
    
    // getFENFromPuzzle().then(FEN => console.log(FEN));
    

    function fenToBoard(fen) {
        const pieces = {
            'p': 'pawn',
            'r': 'rook',
            'n': 'knight',
            'b': 'bishop',
            'q': 'queen',
            'k': 'king',
            'P': 'pawn',
            'R': 'rook',
            'N': 'knight',
            'B': 'bishop',
            'Q': 'queen',
            'K': 'king'
        };
    
        const board = [];
        const colors = []; // array to store colors
        const rows = fen.split(' ')[0].split('/');
        for (let row of rows) {
            const boardRow = [];
            const colorRow = []; // row to store colors
            for (let char of row) {
                if (isNaN(char)) { // if the character is not a number
                    boardRow.push(pieces[char]);
                    colorRow.push(char === char.toLowerCase() ? 'black' : 'white'); // if char is lowercase, color is black, otherwise white
                } else { // if it is a number, add that many 'empty' strings
                    for (let i = 0; i < parseInt(char); i++) {
                        boardRow.push('empty');
                        colorRow.push('empty'); // no color for empty squares
                    }
                }
            }
            board.push(boardRow);
            colors.push(colorRow); // push color row
        }
        return { board, colors };
    }
    

    function getTurnFromFEN(fen) {
        const fenParts = fen.split(" ");
        return fenParts[1] === 'w' ? 'white' : 'black';
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        // Initial load
        const array = Array(8).fill().map(() => Array(8).fill('empty'));
        const emptyChessboard = new Chessboard('chessboard-empty', array, array, 'white');
        loadPuzzle();
    
        // Add event listener to the button
        document.getElementById('generate-puzzle').addEventListener('click', loadPuzzle);
    });
    
    function loadPuzzle() {
        // Remove old chessboard
        const chessboardElement = document.getElementById('chessboard');
        while (chessboardElement.firstChild) {
            chessboardElement.firstChild.remove();
        }
    
        getRandomPuzzle().then(puzzle => {
            const {board, colors} = fenToBoard(puzzle.fen);
            const chessboard = new Chessboard('chessboard', board, colors, getTurnFromFEN(puzzle.fen));
    
            displayPuzzleInfo(puzzle.metadata);
        });
    }
    
    
