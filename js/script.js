// get reference to the chessboard element
const chessboard = document.getElementById('chessboard');


// initial configuration of the chessboard
const pieces = [
    ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'], // 1st row - black
    ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'], // 2nd row - black
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'], // 3rd row
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'], // 4th row
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'], // 5th row
    ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'], // 6th row
    ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'], // 7th row - white
    ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'], // 8th row - white
];

// create 8x8 squares
for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
        // create a new div element
        const square = document.createElement('div');
        
        // add 'square' class to the div
        square.classList.add('square');
        
        // set data attributes for row and column
        square.dataset.row = row + 1;
        square.dataset.col = col + 1;

        // if the sum of row and column is even, add 'light' class, else add 'dark' class
        if ((row + col) % 2 === 0) {
            square.classList.add('light');
        } else {
            square.classList.add('dark');
        }

        // if the piece is not 'empty', create an image element and append it to the square
        const piece = pieces[row][col];
        if (piece !== 'empty') {
            const img = document.createElement('img');
            img.src = `img/${piece}.png`;
            img.id = `${piece}-${row}-${col}`;  
            img.classList.add('piece');
            img.classList.add(row < 2 ? 'black' : 'white'); // first 2 rows are black, last 2 rows are white
            square.appendChild(img);
        }

        // add the square to the chessboard
        chessboard.appendChild(square);
    }
}



let pieceClone = null;
let selectedPiece = null;
let selectedSquare = null;

const pieces2 = document.querySelectorAll('.piece');
pieces2.forEach((piece) => {
    piece.addEventListener('mousedown', (e) => {
        e.preventDefault();

        pieceClone = piece.cloneNode(true);
        pieceClone.style.position = "fixed";
        pieceClone.style.pointerEvents = "none";
        pieceClone.id = 'clone';
        document.body.appendChild(pieceClone);

        selectedPiece = piece;
        selectedSquare = piece.parentElement;

        selectedPiece.classList.add('invisible');

        movePieceClone(e);
    });
});

function movePieceClone(e) {
    if (!pieceClone) return;
    pieceClone.style.left = (e.clientX - pieceClone.offsetWidth / 2) + 'px';
    pieceClone.style.top = (e.clientY - pieceClone.offsetHeight / 2) + 'px';
}

document.addEventListener('mousemove', movePieceClone);

document.addEventListener('mouseup', () => {
    if (!selectedPiece || !pieceClone) return;
    selectedPiece.style.position = 'static';
    selectedSquare.appendChild(selectedPiece);
    selectedPiece = null;
    selectedSquare = null;
    document.body.removeChild(pieceClone);
    pieceClone = null;
});

const squares = document.querySelectorAll('.square');
squares.forEach((square) => {
    square.addEventListener('mouseup', (e) => {
        e.preventDefault();
        if (selectedPiece) {
            square.appendChild(selectedPiece);

            selectedPiece.classList.remove('invisible');
            selectedSquare = square;
        }
    });
});
