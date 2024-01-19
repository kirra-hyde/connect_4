"use strict";

/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */


class Game {

  constructor(width = 7, height = 6) {
    if (!Number.isInteger(width) || width <= 0) {
      throw new Error("Width must be positive integer");
    }
    if (!Number.isInteger(height) || height <= 0) {
      throw new Error("Height must be positive integer");
    }

    this.width = width;
    this.height = height;
    this.board = this.makeBoard(); // array of rows, rows are arrays of cells (board[y][x])
    this.currPlayer = 1; //active player: 1 or 2
    this.finished = false; //is the game over? true or false

    this.makeHtmlBoard();
  }


  /** Create in-JS board structure, for logic.
   *
   * Will become the "board" property of Game instances.
   */

  makeBoard() {
    const board = [];

    for (let y = 0; y < this.height; y++) {
      const row = new Array(this.width).fill(null);
      board.push(row);
    }
    return board;
  }


  /** Reset DOM.  Then, make HTML table with a row of column tops */

  makeHtmlBoard() {
    const htmlBoard = document.getElementById('board');
    htmlBoard.innerHTML = "";
    document.getElementById("end-message").innerHTML = "";
    startButton.style.display = "none";

    // make row above game board and make it listen for clicks
    const top = document.createElement("tr");
    top.setAttribute("id", "column-top");
    top.addEventListener("click", this.handleClick.bind(this));

    // add cells to row above game board corresponding to game board columns
    for (let x = 0; x < this.width; x++) {
      const headCell = document.createElement("td");
      headCell.setAttribute("id", `${x}-top`);
      top.append(headCell);
    }
    htmlBoard.append(top);

    // create the main part of html board
    for (let y = 0; y < this.height; y++) {
      const row = document.createElement("tr");

      for (let x = 0; x < this.width; x++) {
        const cell = document.createElement("td");
        cell.setAttribute("id", `cell-${y}-${x}`);
        row.append(cell);
      }
      htmlBoard.append(row);
    }
  }


  /** findSpotForCol: given column x, return bottom empty y (null if filled) */

  findSpotForCol(x) {

    for (let y = this.height - 1; y >= 0; y--) {

      if (this.board[y][x] === null) {
        return y;
      }
    }
    return null;
  }


  /** placeInTable: update DOM to place piece into HTML table of board */

  placeInTable(y, x) {
    const cell = document.getElementById(`cell-${y}-${x}`);

    const piece = document.createElement("div");
    piece.classList.add('piece');
    piece.classList.add(`p${this.currPlayer}`);

    cell.append(piece);
  }


  /** handleClick: handle click of column top to play piece */

  handleClick(evt) {
    //checks that game isn't over
    if (this.finished) {
      return;
    }

    // get x from ID of clicked cell
    const x = parseInt(evt.target.id);

    // get next spot in column (if none, ignore click)
    const y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }

    // place piece in board and add to HTML table
    this.placeInTable(y, x);
    this.board[y][x] = this.currPlayer;

    // check for win
    if (this.checkForWin()) {
      this.endGame(`Player ${this.currPlayer} won!`);
      return;
    }

    // check for tie: if top row is filled, the whole board is filled
    if (!this.board[0].some(cell => cell === null)) {
      this.endGame("Tie game");
      return;
    }

    // switch players
    this.currPlayer = (this.currPlayer === 1) ? 2 : 1;
  }


  /** checkForWin: check board cell-by-cell for "does a win start here?" */

  checkForWin() {

    /** _win:
    * takes input array of 4 cell coordinates [ [y, x], [y, x], [y, x], [y, x] ]
    * returns true if all are legal coordinates & all cells match currPlayer
    */
    const _win = cells => {

      for (let cell of cells) {
        const [y, x] = cell;

        if (y < 0 ||
          y >= this.height ||
          x < 0 ||
          x >= this.width ||
          this.board[y][x] !== this.currPlayer
        ) {
          return false;
        }
      }
      return true;
    }

    // get check list of 4 cells (starting) here for each four directions
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {

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


  /** endGame: announce game end and disable clicks */

  endGame(msg) {
    this.finished = true;
    const endBox = document.getElementById("end-message");
    endBox.innerText = msg;
    startButton.innerText = "Play again?";
    startButton.style.display = "block";
  }
}


const startButton = document.getElementById("start");
startButton.addEventListener("click", () => new Game);

