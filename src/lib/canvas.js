define(function (require) {
  const DOM = require('helper').DOM;
  const arrayFromObj = require('helper').array.fromObj;

  class Canvas {
    constructor(width = 400, height = 400, gridWidth = 40, gridHeight = 40) {
      this.gridsNumber = new Vector( Math.floor(width/gridWidth), Math.floor(height/gridHeight) );

      this.width  = width;
      this.height = height;
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
  
  Canvas.prototype.drawMap = function(mapArray){
    
    for(let i = 0; i < mapArray.length; i++){
      for(let j = 0; j < mapArray[0].length; j++){
        if(mapArray[i][j] !== "empty"){
          const src = "img/background/" + mapArray[i][j];
          const img = DOM.createElement("img", {src : src});
          const drawPosition = new Vector(i * this.gridWidth, j * this.gridHeight);

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
