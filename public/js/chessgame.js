const socket = io();

// socket.emit("abc");
// socket.on("abc-send",function(){
//     console.log("receive on frontend")
// })


const chess = new Chess();
const boardElement = document.querySelector(".chessboard")
let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    
    board.forEach((row, rowindex) => {

        row.forEach((square, squareindex) => {
            
            const squareElement = document.createElement("div");
            squareElement.classList.add("square",
                (rowindex + squareindex) % 2 === 0 ? "light" : "dark",
            )
            squareElement.dataset.row = rowindex; //this is each square elemnt have some rowidx and colidx stored in this sE.ds.r
            squareElement.dataset.col = squareindex

            if (square) { //if it hold piece and not null
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece",  //add piece on basis of color if it is "w" then white
                    square.color === 'w' ? "white" : "black"     //as square have type and color prop from forEach
                )
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => { //event
                    if (pieceElement.draggable) { // if an element is dragabbleit is stored in draggedPiece
                        draggedPiece = pieceElement
                        sourceSquare = { row: rowindex, col: squareindex }  //current value
                        e.dataTransfer.setData("text/plain", "");   //set-up data and is irrelevent for here and just used upfor cross platform accessand to remove problems for draggable ----function hence a necessity
                    }
                })
                pieceElement.addEventListener("dragend", (e) => {
                    draggedPiece = null; // as no one is getting dragged make it null again
                    sourceSquare = null;
                })
                squareElement.appendChild(pieceElement) //pawn over block
            }
            squareElement.addEventListener("dragover", function (e) {    // stop when it drags over a box forcefully
                e.preventDefault();
            })
            squareElement.addEventListener("drop", function (e) {
                e.preventDefault(); //stop basic nature to perform
                if (draggedPiece) {
                    const targetSource = { // where to reach means where it was dragged
                        row: parseInt(squareElement.dataset.row), // got the value of r,c idx like d5 etc
                        col: parseInt(squareElement.dataset.col),
                    }
                    handelMove(sourceSquare, targetSource)
                }
            })
            boardElement.appendChild(squareElement)

        })
    })
    if(playerRole==='b'){
        boardElement.classList.add("flipped");
    }else{
        boardElement.classList.remove("flipped");
    }
}


const handelMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q'
    }
    const testChess = new Chess(chess.fen());
    const moveResult = testChess.move(move); // Try the move

    if (moveResult) {
        console.log("chl pa rha hu")
        socket.emit("move", move);
        // Don’t call renderBoard() here — wait for server response
    } else {
        console.log("nah ho rha yrr")
        console.log("Invalid move attempted:", move);
    }
}

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p: "♟",
        r: "♜",
        n: "♞",
        b: "♝",
        q: "♛",
        k: "♚",
        P: "♙",
        R: "♖",
        N: "♘",
        B: "♗",
        Q: "♕",
        K: "♔",
    }
    return unicodePieces[piece.type] || "";
}


socket.on("playerRole", function (role) {
    playerRole = role;
    renderBoard();
})

socket.on("spectatorRole", function () {
    playerRole = null;
    renderBoard();
})

socket.on("boardstate", function (fen) {
    chess.load(fen);
    renderBoard();
})

socket.on("move", function (move) {
    chess.move(move);
    renderBoard();
})

renderBoard();

