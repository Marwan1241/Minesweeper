window.addEventListener('load', () => {
   minesweeper.init();
});

//create an object called minesweeper
const minesweeper = {
   logic: null,
   gameTypes : [
      {
         name: 'small',
         size: 9,
         mines: 10
      },
      {
         name: 'medium',
         size: 16,
         mines: 40
      },
      {
         name: 'large',
         size: 24,
         mines: 150
      }
   ],

   init() {
      this.logic = localLogic;
      this.renderGame();
   },
   renderGame() {
      const body = document.querySelector('body');
      const content = document.createElement('div');
      content.classList.add('container');
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
      const header = document.createElement('header');
      var headerDiv = document.createElement('div');
      header.appendChild(headerDiv);
      const h1 = document.createElement('h1');
      headerDiv.appendChild(h1);
      h1.innerText = 'Minesweeper';
      const p = document.createElement('p');
      headerDiv.appendChild(p);
      p.innerText = 'by Khalid Sharaf';
      return header;
   },
   buildFooter(){
      const footer = document.createElement('footer');
      var footerDiv = document.createElement('div');
      footerDiv.classList.add('copyright');
      footer.appendChild(footerDiv);
      const p = document.createElement('p');
      footerDiv.appendChild(p);
      p.innerHTML = '&copy; Khalid Sharaf';
      return footer;
   },
   buildPlayFieled() {
      const playField = document.createElement('div');
      playField.id = 'Playfield';
      return playField;
   },
   buildButtonBar(){
      const buttonBar = document.createElement('div');
      buttonBar.id = 'Buttons';
      const smallButton = document.createElement('button');
      smallButton.classList.add('block');
      smallButton.id = 'GameSmall';
      smallButton.innerText = 'Small';
      buttonBar.appendChild(smallButton);
      const mediumButton = document.createElement('button');
      mediumButton.classList.add('block');
      mediumButton.id = 'GameMedium';
      mediumButton.innerText = 'Medium';
      buttonBar.appendChild(mediumButton);
      const largeButton = document.createElement('button');
      largeButton.classList.add('block');
      largeButton.id = 'GameLarge';
      largeButton.innerText = 'Large';
      buttonBar.appendChild(largeButton);
  

      smallButton.addEventListener('click', () => {
         this.startNewGame('small');
      });
      mediumButton.addEventListener('click', () => {
         this.startNewGame('medium');
      });
      largeButton.addEventListener('click', () => {
         this.startNewGame('large');
      });

      return buttonBar;

   },
   generateCell(size){
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.classList.add('covered');
      const style = `calc((100% / ${size}) - 8px)`;
      cell.style.width = style;
      cell.style.height = style;

      cell.addEventListener('click', (event) => {
         this.cellClicked(event);
      });

      cell.addEventListener('contextmenu', (event) => {
         this.cellRightClicked(event);
      });

      cell.addEventListener('touchstart', (event) => {
         this.cellTouchStart(event);
      });

      cell.addEventListener('touchend', (event) => {
         this.cellTouchEnd(event);
      });

      return cell;
   },
   renderGameTypes(size){
      const playField = document.querySelector('#Playfield');
      playField.innerHTML = '';
      for(let row = 0; row < size; row++ ){
         for(let column = 0; column < size; column++){
            const cell = this.generateCell(size);
            playField.appendChild(cell);
            
            cell.dataset.x = column;
            cell.dataset.y = row;
         }
      }
   },
   startNewGame(gameType){
      for(const element of this.gameTypes){
         if(element.name === gameType){
            const size = element.size;
            const mines = element.mines;
            this.renderGameTypes(size);
            this.logic.init(size, mines);
         }
      }
   },
   getCell(x,y){
      return document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
   },
   placeSymbol(x , y , symbol){
      const cell = this.getCell(x,y);

      if(symbol){
         cell.classList.remove('covered');
         cell.classList.add(symbol);
      } else {
         cell.classList.remove('covered');
         cell.classList.add('uncovered');
      }
   },
   cellClicked(event){
      event.preventDefault();

      const x = event.target.dataset.x;
      const y = event.target.dataset.y;

      const result = this.logic.sweep(x , y);

      if(result.mineHit === true){
         this.placeSymbol(x,y,'mine');
      } else {
         for(let cell of result.emptyCells){
            this.placeSymbol(cell.x, cell.y);
         }
         console.log(result);
      }
   },
   cellRightClicked(event){
      event.preventDefault();

      const x = event.target.dataset.x;
      const y = event.target.dataset.y;
   },
   cellTouchStart(event){
      event.preventDefault();

      const touchStart = new Date().getTime();

      return touchStart;
   },
   cellTouchEnd(event){
      event.preventDefault();

      const touchEnd = new Date().getTime() - this.cellTouchStart(event);

      if(touchEnd < 500){
         this.cellClicked(event);
      }else{
         this.cellRightClicked(event);
      }
   }
}



const localLogic = {
   moveCounter : 0,
   field : [],
   numberOfMines : [],
   init (size, mines) {
      this.size = size;
      this.mines = mines;
      this.moveCounter = 0;

      for(let row = 0; row < size; row++){
         this.field[row] = [];
         for(let column = 0; column < size; column++){
            this.field[row][column] = false;
         }
      }

      console.dir(this.field);
   },
   sweep(parceX, parceY){
      const x = parseInt(parceX);
      const y = parseInt(parceY);
      
      if(this.moveCounter === 0){
         this.placeMines(x, y);
      }
      this.moveCounter++;

      if(this.field[y][x] === true){
         return {mineHit : true};
      } else {
         const minesAround = this.countMinesAround(x, y);
         const emptyCells = minesAround > 0 ? undefined : this.getEmptyCells(x, y);
         return {minesHit : false, minesAround : minesAround , emptyCells : emptyCells};
      }
   },
   countMinesAround(x, y){
      let minesAround = 0;
      for(dx = -1; dx <= 1; dx++){
         for(dy = -1; dy <= 1; dy++){
            if(this.getSafe(x + dx, y + dy)){
               minesAround++;
            }
         }
      }
      return minesAround;  
   },
   placeMines(x, y){
      let minesPlaced = 0;
      while(minesPlaced < this.mines){
         const randomX = Math.floor(Math.random() * this.size);
         const randomY = Math.floor(Math.random() * this.size);
         if(randomX !== x && randomY !== y){
            this.field[randomY][randomX] = true;
            minesPlaced++;
         }
      }
      console.dir(this.field);
   },
   getSafe(x, y){
      if(x < 0 || x >= this.size || y < 0 || y >= this.size){
         return undefined;
      }
      return this.field[y][x];
   },
   getEmptyCells(x, y){
      todo = [
         {x : x, y : y, minesAround: 0},
      ];
      done = [];
      while(todo.length != 0){
         const listOfNeighbours  = this.getNeighbours(x , y);
         const cell = todo.shift();
         done.push(cell);
         for(const n of listOfNeighbours){
            if(this.enlist(done , n)){
               continue;     
            }
            if(n.minesAround){
                  done.push(n);
               }else {
                  todo.push(n);
               }
         }
      };

      return done;
   },
   getNeighbours(x, y){
      const neighbours = [];
      let minesAround = 0;
      for(dx = -1; dx <= 1; dx++){
         for(dy = -1; dy <= 1; dy++){
            if(dx === 0 && dy === 0){
               continue;
            }
            const neighbour = this.getSafe(x + dx, y + dy);
            if(neighbour === undefined){
               continue;
            }
            if(neighbour === true){
               minesAround++;
            }
            neighbours.push({x : x + dx, y : y + dy, minesAround : minesAround});
         }
      }
      return neighbours;
   },
   enlist(list, element){
      return list.some((e) => {
         return e.x === element.x || e.y === element.y;
      });
   }
}
