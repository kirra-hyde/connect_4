"use strict";

/** Game Players
 *
 * Players have colors. They're meant to be passed into Game objects.
 */

class Player {
  constructor(color) {
    if (!CSS.supports("background-color", color)) {
      throw new Error(`${color} is not a valid color`);
    }

    this.color = color;
  }
}


/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie).
 */

class Game {

  constructor(p1, p2, width = 7, height = 6) {
    if (!Number.isInteger(width) || width <= 0) {
      throw new Error("Width must be positive integer");
    }
    if (!Number.isInteger(height) || height <= 0) {
      throw new Error("Height must be positive integer");
    }

    this.width = width;
    this.height = height;
    this.board = this.makeBoard(); // array of rows, rows are arrays of cells (board[y][x])
    this.p1 = p1;  //Player object
    this.p2 = p2;  //Player object
    this.currPlayer = p1; //active player: 1 or 2
    this.finished = false; //is the game over? true or false

    this.makeHtmlBoard();
    this.colorsMap = {
      aqua: "Blue",
      crimson: "Red",
      gold: "Yellow",
      darkviolet: "Purple",
      deeppink: "Pink",
      springgreen: "Green"
    };
  }


  /** makeBoard:
   *
   * create in-JS board structure, for logic
   * will become the "board" property of the Game object
   */

  makeBoard() {
    const board = [];

    for (let y = 0; y < this.height; y++) {
      const row = new Array(this.width).fill(null);
      board.push(row);
    }
    return board;
  }


  /** makeHtmlBoard: make HTML table with a row of column tops */

  makeHtmlBoard() {
    const htmlBoard = document.getElementById('board');

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


  /** placeInTable: update DOM to place piece into HTML board */

  placeInTable(y, x) {
    const cell = document.getElementById(`cell-${y}-${x}`);

    const piece = document.createElement("div");
    piece.classList.add('piece');
    piece.style.backgroundColor = this.currPlayer.color;

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
      this.endGame(`${this.colorsMap[this.currPlayer.color] || this.currPlayer.color} player wins!`);
      return;
    }

    // check for tie: if top row is filled, the whole board is filled
    if (!this.board[0].some(cell => cell === null)) {
      this.endGame("Tie game");
      return;
    }

    // switch players
    this.currPlayer = (this.currPlayer === this.p1) ? this.p2 : this.p1;
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
    };

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


  /** endGame: announce game end, disable clicks, display restart button */

  endGame(msg) {
    this.finished = true;
    const endBox = document.getElementById("end-message");
    endBox.innerText = msg;
    restart.style.display = "block";
  }


  /** startGame:
   *
   * validate that two different colors were selected in player selection form
   * clear the player selection form from DOM
   * create a Game object and 2 Player objects, passing in colors from the form
  */

  static startGame() {
    const p1Color = document.getElementById("p1-color").value;
    const p2Color = document.getElementById("p2-color").value;

    const errorMessage = document.getElementById("error-msg");

    if (p1Color === p2Color) {
      errorMessage.innerText = "Player 1 and Player 2 must choose different colors";
      return;
    }

    errorMessage.innerText = "";
    const startScreen = document.getElementById("player-select");
    startScreen.style.display = "none";


    const p1 = new Player(p1Color);
    const p2 = new Player(p2Color);
    new Game(p1, p2);
  }
}


const startButton = document.getElementById("start");
startButton.addEventListener("click", Game.startGame);

const restartButton = document.getElementById("restart");
restartButton.addEventListener("click", showSelectionScreen);


/** showSelectionScreen:
 *
 * clear HTML board, clear game end message,
 * hide restart button, display player selection screen
 */

function showSelectionScreen() {

  document.getElementById("board").innerHTML = "";
  document.getElementById("end-message").innerText = "";
  restartButton.style.display = "none";
  document.getElementById("player-select").style.display = "block";

}