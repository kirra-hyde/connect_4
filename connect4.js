"use strict";

/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const WIDTH = 7;
const HEIGHT = 6;

let currPlayer = 1; // active player: 1 or 2
const board = []; // array of rows, each row is array of cells  (board[y][x])
let finished = false;


/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */

function makeBoard(width = WIDTH, height = HEIGHT) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new Error("Width and height must be positive integers");
  }

  for (let y = 0; y < height; y++) {
    const row = new Array(width).fill(null);
    board.push(row);
  }
}


/** makeHtmlBoard: make HTML table and row of column tops. */

function makeHtmlBoard(board) {
  const htmlBoard = document.getElementById('board');

  // make row above game board and make it listen for clicks

  const top = document.createElement("tr");
  top.setAttribute("id", "column-top");
  top.addEventListener("click", handleClick);

  // add cells to top row corresponding to game board columns
  for (let x = 0; x < board[0].length; x++) {
    const headCell = document.createElement("td");
    headCell.setAttribute("id", `${x}-top`);
    top.append(headCell);
  }
  htmlBoard.append(top);

  // create the main part of html board
  for (let y = 0; y < board.length; y++) {
    const row = document.createElement("tr");
    row.setAttribute("id", `row-${y}`);

    for (let x = 0; x < board[y].length; x++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `cell-${y}-${x}`);

      row.append(cell);
    }
    htmlBoard.append(row);
  }
}



/** findSpotForCol: given column x, return bottom empty y (null if filled) */

function findSpotForCol(x) {
  for (let y = board.length - 1; y >= 0; y--) {
    if (board[y][x] === null) {
      return y;
    }
  }
  return null;
}


/** placeInTable: update DOM to place piece into HTML table of board */

function placeInTable(y, x) {
  const piece = document.createElement("div");
  piece.classList.add('piece');
  piece.classList.add(`p${currPlayer}`);

  const cell = document.getElementById(`cell-${y}-${x}`);
  cell.append(piece);
}

/** endGame: announce game end and disable clicks*/

function endGame(msg) {
  finished = true;
  const endBox = document.getElementById("end-message");
  endBox.innerText = msg;
}

/** handleClick: handle click of column top to play piece */

function handleClick(evt) {

  //checks that game isn't over
  if (finished) {
    return;
  }

  // get x from ID of clicked cell
  const x = parseInt(evt.target.id);

  // get next spot in column (if none, ignore click)
  const y = findSpotForCol(x);
  if (y === null) {
    return;
  }

  // place piece in board and add to HTML table
  placeInTable(y, x);
  board[y][x] = currPlayer;

  // check for win
  if (checkForWin()) {
    endGame(`Player ${currPlayer} won!`);
    return;
  }

  // check for tie: if top row is filled, the whole board is filled
  if (!board[0].some(cell => cell === null)) {
    endGame("Tie game");
    return;
  }

  // switch players
  currPlayer = (currPlayer === 1) ? 2 : 1;
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */

function checkForWin() {

  /** _win:
   * takes input array of 4 cell coordinates [ [y, x], [y, x], [y, x], [y, x] ]
   * returns true if all are legal coordinates for a cell & all cells match
   * currPlayer
   */
  function _win(cells) {

    for (let cell of cells) {
      const [y, x] = cell;

      if (y < 0 ||
        y >= board.length ||
        x < 0 ||
        x >= board[0].length ||
        board[y][x] !== currPlayer
      ) {
        return false;
      }
    }
    return true;
  }

  // get check list of 4 cells (starting) here for each four directions
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {

      let horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      let vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
      let diagDL = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
      let diagDR = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

      // find winner (only checking each win-possibility as needed)
      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        return true;
      }
    }
  }
}

makeBoard();
makeHtmlBoard(board);
