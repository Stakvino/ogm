define(function (require) {
  const DOM = require('helper').DOM;
  const arrayFromObj = require('helper').array.fromObj;

  class Canvas {
    constructor(width = 400, height = 400, gridWidth = 40, gridHeight = 40) {
      this.width  = Math.floor( width/gridWidth ) * gridWidth;
      this.height = Math.floor( height/gridHeight ) * gridHeight;
      this.gridWidth  = gridWidth;
      this.gridHeight = gridHeight;

      this.DOMCanvas = DOM.createElement("canvas", {width : this.width, height : this.height});
      this.ctx = this.DOMCanvas.getContext("2d");
    }
  }
  
  Canvas.prototype.clear = function(){
    this.ctx.clearRect(0,0,this.width,this.height);
  }

  Canvas.prototype.clearGrid = function(gridPosition){
    this.ctx.clearRect(gridPosition.x,gridPosition.y,this.gridWidth,this.gridHeight);
  }

  Canvas.prototype.drawGridLine = function(gridPosition){
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.rect(gridPosition.x,gridPosition.y,this.gridWidth,this.gridHeight); 
    this.ctx.stroke();
  } 

  Canvas.prototype.drawGridLines = function(){
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    for(let i = 0; i <= this.width; i += this.gridWidth){
      for(let j = 0; j <= this.height; j += this.gridHeight){
        this.ctx.rect(i,j,this.gridWidth,this.gridHeight); 
      }
    }
    this.ctx.stroke();
  }

  Canvas.prototype.drawImage = function(drawArgs){
    drawArgs = arrayFromObj(drawArgs);
    this.ctx.drawImage(...drawArgs);
  }
  
  Canvas.prototype.drawColor = function(gridPosition, color){
    this.ctx.fillStyle = color;
    this.ctx.fillRect(gridPosition.x,gridPosition.y,this.gridWidth,this.gridHeight);
  }
  
  Canvas.prototype.drawMap = function(map){

    for(let i = 0; i < map.rowsNumber; i++){
      for(let j = 0; j < map.columnsNumber; j++){
        if(map.array[i][j] !== "empty"){
          const src = "img/background/" + map.array[i][j];
          const img = DOM.createElement("img", {src : src});
          const drawPosition = new Vector(j * this.gridWidth, i * this.gridHeight);

          img.addEventListener("load", () => {
            const drawArgs = {
                  img : img,
                  x   : drawPosition.x,
                  y   : drawPosition.y,
                  width  : this.gridWidth,
                  height : this.gridHeight
                };
            this.drawImage(drawArgs);
          });  
        }
      }
    }
    
  }
  
  /******************************************************************************/

  return {
    Canvas : Canvas
  }
    
});
