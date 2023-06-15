import { Chessboard } from './chessboard.js';
import { parseMoveStringsHandler} from './move_string_handler.js';
import { ChessPuzzle } from './chess_puzzle.js';


    async function getRandomPuzzle() {
        const response = await fetch('puzzles2.txt', {
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        const data = await response.text();
        //console.log(data);
        const puzzles = data.split(/\r?\n\r?\n\r?\n/);
        //console.log(puzzles);
        const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
        const lines = randomPuzzle.split('\n');
        const metadata = lines[0];  // Extract the first line
        const fen = lines[1];  // Extract the second line
        const move_sequence = lines[2];  // Extract the third line
        return { metadata, fen, move_sequence};
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
        const colors = []; 
        const rows = fen.split(' ')[0].split('/');
        for (let row of rows) {
            const boardRow = [];
            const colorRow = []; 
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

    function resetScore() {
        // Confirm with the user
        let isConfirmed = confirm("Are you sure you want to reset the score?");
        
        // If the user clicks "OK", then reset the score
        if (isConfirmed) {
            let scoreElement = document.getElementById('score');
            
            // Set the current score to 0
            let currentScore = 0;
            localStorage.setItem('score', currentScore);
            scoreElement.textContent = `Score: ${currentScore}`;
        }
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        // Initial load
        const array = Array(8).fill().map(() => Array(8).fill('empty'));
        const emptyChessboard = new Chessboard('chessboard-empty', new ChessPuzzle(array, array, 'white', [], [], ''));
        loadPuzzle();

        document.getElementById('reset-score').addEventListener('click', () => {
            let sound = document.getElementById('click_sound');
            sound.play();
            resetScore.bind(this)();
        });

        document.getElementById('generate-hint').addEventListener('click', () => {
            let sound = document.getElementById('click_sound');
            sound.play();
        });
    
        document.getElementById('generate-puzzle').addEventListener('click', loadPuzzle);
        document.getElementById('generate-puzzle').addEventListener('click', () => {
            let sound = document.getElementById('click_sound');
            sound.play();
        });
    });
    

    let chessboard;
    function loadPuzzle() {
        const chessboardElement = document.getElementById('chessboard');
        while (chessboardElement.firstChild) {
            chessboardElement.firstChild.remove();
        }
        
        getRandomPuzzle().then(puzzle => {
            const {board, colors} = fenToBoard(puzzle.fen);
            const turn = getTurnFromFEN(puzzle.fen);
            const initialRequest = { moveString: puzzle.move_sequence };
            const result = parseMoveStringsHandler.handle(initialRequest);
            const blackMoves = result.puzzleMovesWithFullNames.blackMoves;
            const whiteMoves = result.puzzleMovesWithFullNames.whiteMoves;

            const chessPuzzle = new ChessPuzzle(board, colors, turn, blackMoves, whiteMoves, puzzle.metadata);
            console.log(chessPuzzle);
            console.log(whiteMoves);
            console.log(blackMoves);
            if(chessboard) { chessboard.cleanup();}
            chessboard = new Chessboard('chessboard', chessPuzzle);
            
            displayPuzzleInfo(puzzle.metadata);
            document.getElementById('sparkles-left').style.display = 'none';
            document.getElementById('sparkles-right').style.display = 'none';
            let currentScore = parseInt(localStorage.getItem('score')) || 0;
            let scoreElement = document.getElementById('score');
            scoreElement.textContent = `Score: ${currentScore}`;
            
        });
    }
    
    
