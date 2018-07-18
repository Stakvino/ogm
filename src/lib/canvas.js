define(function (require) {
    const DOM = require('helper').DOM;
    
    class Canvas {
      constructor(width = 400, height = 400, gridWidth = 40, gridHeight = 40) {
        this.width  = width;
        this.height = height;
        this.gridWidth  = gridWidth;
        this.gridHeight = gridHeight;
        this.gridsNumber = new Vector( Math.floor(width/gridWidth), Math.floor(height/gridHeight) );
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
          this.ctx.moveTo(i, 0);
          this.ctx.lineTo(i, this.height);
      }
      for(let i = 0; i <= this.height; i += this.gridHeight){
          this.ctx.moveTo(0, i);
          this.ctx.lineTo(this.width, i);
      }
      this.ctx.stroke();
    }
    
    Canvas.prototype.drawImage = function(drawArgs){
      drawArgs = objToArray(drawArgs);
      this.ctx.drawImage(...drawArgs);
    }

    /******************************************************************************/

    return {
      Canvas : Canvas
    }
    
});
