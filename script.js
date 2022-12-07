window.addEventListener("load", () => {
  minesweeper.init();
});

//create an object called minesweeper
const minesweeper = {
  logic: null,
  gameTypes: [
    {
      name: "small",
      size: 9,
      mines: 10,
    },
    {
      name: "medium",
      size: 16,
      mines: 40,
    },
    {
      name: "large",
      size: 24,
      mines: 150,
    },
  ],

  init() {
    this.logic = localLogic;
    this.renderGame();
  },
  renderGame() {
    const body = document.querySelector("body");
    const content = document.createElement("div");
    content.classList.add("container");
    body.appendChild(content);

    var header = this.buildHeader();
    content.appendChild(header);

    var playField = this.buildPlayFieled();
    content.appendChild(playField);

    var buttonBar = this.buildButtonBar();
    content.appendChild(buttonBar);

    var footer = this.buildFooter();
    content.appendChild(footer);
  },
  buildHeader() {
    const header = document.createElement("header");
    var headerDiv = document.createElement("div");
    header.appendChild(headerDiv);
    const h1 = document.createElement("h1");
    headerDiv.appendChild(h1);
    h1.innerText = "Minesweeper";
    const p = document.createElement("p");
    headerDiv.appendChild(p);
    p.innerText = "by Khalid Sharaf";
    return header;
  },
  buildFooter() {
    const footer = document.createElement("footer");
    var footerDiv = document.createElement("div");
    footerDiv.classList.add("copyright");
    footer.appendChild(footerDiv);
    const p = document.createElement("p");
    footerDiv.appendChild(p);
    p.innerHTML = "&copy; Khalid Sharaf";
    return footer;
  },
  buildPlayFieled() {
    const playField = document.createElement("div");
    playField.id = "Playfield";
    return playField;
  },
  buildButtonBar() {
    const buttonBar = document.createElement("div");
    buttonBar.id = "Buttons";
    const smallButton = document.createElement("button");
    smallButton.classList.add("block");
    smallButton.id = "GameSmall";
    smallButton.innerText = "Small";
    buttonBar.appendChild(smallButton);
    const mediumButton = document.createElement("button");
    mediumButton.classList.add("block");
    mediumButton.id = "GameMedium";
    mediumButton.innerText = "Medium";
    buttonBar.appendChild(mediumButton);
    const largeButton = document.createElement("button");
    largeButton.classList.add("block");
    largeButton.id = "GameLarge";
    largeButton.innerText = "Large";
    buttonBar.appendChild(largeButton);

    smallButton.addEventListener("click", () => {
      this.startNewGame("small");
    });
    mediumButton.addEventListener("click", () => {
      this.startNewGame("medium");
    });
    largeButton.addEventListener("click", () => {
      this.startNewGame("large");
    });

    return buttonBar;
  },
  generateCell(size) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.classList.add("covered");
    const style = `calc((100% / ${size}) - 8px)`;
    cell.style.width = style;
    cell.style.height = style;

    cell.addEventListener("click", (event) => {
      this.cellClicked(event);
    });

    cell.addEventListener("contextmenu", (event) => {
      this.cellRightClicked(event);
    });

    cell.addEventListener("touchstart", (event) => {
      this.cellTouchStart(event);
    });

    cell.addEventListener("touchend", (event) => {
      this.cellTouchEnd(event);
    });

    return cell;
  },
  renderGameTypes(size) {
    const playField = document.querySelector("#Playfield");
    playField.innerHTML = "";
    for (let row = 0; row < size; row++) {
      for (let column = 0; column < size; column++) {
        const cell = this.generateCell(size);
        playField.appendChild(cell);

        cell.dataset.x = column;
        cell.dataset.y = row;
      }
    }
  },
  startNewGame(gameType) {
    for (const element of this.gameTypes) {
      if (element.name === gameType) {
        const size = element.size;
        const mines = element.mines;
        this.renderGameTypes(size);
        this.logic.init(size, mines);
      }
    }
  },
  getCell(x, y) {
    return document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
  },
  placeSymbol(x, y, symbol) {
    const cell = this.getCell(x, y);

    cell.classList.remove("covered");
    cell.classList.add("uncovered");

    if (symbol === "console.log(this.mines);mine") {
      cell.classList.add("mine");
    } else {
      cell.classList.add(symbol);
    }
  },
  cellClicked(event) {
    event.preventDefault();
    const x = event.target.dataset.x;
    const y = event.target.dataset.y;

    const result = this.logic.sweep(x, y);

    if (result.mineHit === true) {
      this.placeSymbol(x, y, "mine");
      result.mines.forEach((mine) => {
        this.placeSymbol(mine.x, mine.y, "mine");
      });
      //add mineHit class to the event.target
      event.target.classList.add("mineHit");
    } else {
      for (let cell of result.emptyCells) {
        this.placeSymbol(
          cell.x,
          cell.y,
          this.minesNumberToString(cell.minesAround)
        );
      }
      console.log(result.emptyCells);
    }
  },
  minesNumberToString(mines) {
    switch (mines) {
      case 0:
        return "uncovered";
      case 1:
        return "one";
      case 2:
        return "two";
      case 3:
        return "three";
      case 4:
        return "four";
      case 5:
        return "five";
      case 6:
        return "six";
      case 7:
        return "seven";
      case 8:
        return "eight";
    }
  },
  cellRightClicked(event) {
    event.preventDefault();

    if (event.target.classList.contains("covered")) {
      event.target.classList.remove("covered");
      event.target.classList.add("flag");
    } else if (event.target.classList.contains("flag")) {
      event.target.classList.remove("flag");
      event.target.classList.add("covered");
    }
  },
  cellTouchStart(event) {
    event.preventDefault();

    const touchStart = new Date().getTime();

    return touchStart;
  },
  cellTouchEnd(event) {
    event.preventDefault();

    const touchEnd = new Date().getTime() - this.cellTouchStart(event);

    if (touchEnd < 500) {
      this.cellClicked(event);
    } else {
      this.cellRightClicked(event);
    }
  },
};

const localLogic = {
  moveCounter: 0,
  field: [],
  numberOfMines: [],
  uncoveredCells: [],
  init(size, mines) {
    this.size = size;
    this.mines = mines;
    this.moveCounter = 0;
    this.uncoveredCells = [];

    this.field = [];
    for (let row = 0; row < size; row++) {
      this.field[row] = [];
      for (let column = 0; column < size; column++) {
        this.field[row][column] = false;
      }
    }

    //set the uncovered cells to false
    for (let row = 0; row < size; row++) {
      this.uncoveredCells[row] = [];
      for (let column = 0; column < size; column++) {
        this.uncoveredCells[row][column] = false;
      }
    }

    console.dir(this.field);
  },
  sweep(parceX, parceY) {
    const x = parseInt(parceX);
    const y = parseInt(parceY);

    if (this.moveCounter === 0) {
      this.placeMines(x, y);
      this.moveCounter++;
    }

    this.uncoveredCells[y][x] = true;

    if (this.field[y][x] === true) {
      return { mineHit: true, mines: this.collectMines() };
    } else {
      const minesAround = this.countMinesAround(x, y);
      const emptyCells = this.getEmptyCells(x, y);

      this.getEmptyCells(x, y).forEach((cell) => {
        this.uncoveredCells[cell.x][cell.y] = true;
      });

      let uncoveredCells = this.countUncoveredCells();
      if (uncoveredCells === this.size * this.size - this.numberOfMines) {
        return { userWins: true };
        alert("You Win");
      }

      return {
        minesHit: false,
        minesAround: minesAround,
        emptyCells: emptyCells,
      };
    }
  },
  collectMines() {
    let mines = [];
    for (let row = 0; row < this.size; row++) {
      for (let column = 0; column < this.size; column++) {
        if (this.field[row][column] === true) {
          mines.push({ x: column, y: row });
        }
      }
    }
    return mines;
  },
  countUncoveredCells() {
    let uncoveredCells = 0;
    for (let row = 0; row < this.size; row++) {
      for (let column = 0; column < this.size; column++) {
        if (this.uncoveredCells[row][column] === true) {
          uncoveredCells++;
        }
      }
    }
    return uncoveredCells;
  },
  countMinesAround(x, y) {
    let minesAround = 0;
    for (let row = -1; row <= 1; row++) {
      for (let column = -1; column <= 1; column++) {
        if (this.getSafe(x + column, y + row) === true) {
          minesAround++;
        }
      }
    }
    return minesAround;
  },
  placeMines(x, y) {
    this.numberOfMines = 0;
    while (this.numberOfMines < this.mines) {
      const randomX = Math.floor(Math.random() * this.size);
      const randomY = Math.floor(Math.random() * this.size);
      if (
        this.field[randomX][randomY] === false &&
        randomX !== x &&
        randomY !== y
      ) {
        this.field[randomX][randomY] = true;
        this.numberOfMines++;
      }
    }

    console.dir(this.field);
  },
  getSafe(x, y) {
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
      return undefined;
    }
    return this.field[y][x];
  },
  getEmptyCells(x, y) {
    todo = [{ x: x, y: y, minesAround: 0 }];
    done = [];
    while (todo.length > 0) {
      const cell = todo.shift();
      done.push(cell);
      const neighbours = this.getNeighbours(cell.x, cell.y);
      for (const neighbour of neighbours) {
        if (done.some((e) => e.x === neighbour.x && e.y === neighbour.y)) {
          continue;
        }
        if (neighbour.minesAround === 0) {
          todo.push(neighbour);
        }
        done.push(neighbour);
      }
    }
    return done;
  },
  getNeighbours(x, y) {
    const neighbours = [];
    for (let row = y - 1; row <= y + 1; row++) {
      for (let column = x - 1; column <= x + 1; column++) {
        if (this.getSafe(column, row) === false) {
          neighbours.push({
            x: column,
            y: row,
            minesAround: this.countMinesAround(column, row),
          });
        }
      }
    }
    return neighbours;
  },
  enlist(list, element) {
    return list.some((e) => {
      return e.x === element.x || e.y === element.y;
    });
  },
};
