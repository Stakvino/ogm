define(function (require) {
    const DOM = require('helper').DOM;
    
    class Canvas {
      constructor(width = 400, height = 400, gridWidth = 40, gridHeight = 40) {
        this.DOMCanvas = DOM.createElement("canvas", {width, height});
        this.gridsNumber = new Vector( Math.floor(width/gridWidth), Math.floor(height/gridHeight) );
        this.width  = width + (this.gridsNumber.x*2);
        this.height = height + (this.gridsNumber.y*2);
        this.gridWidth  = gridWidth;
        this.gridHeight = gridHeight;
        this.ctx = this.DOMCanvas.getContext("2d");
      }
    }

    Canvas.prototype.clear = function(){
        this.ctx.clearRect(0,0,this.width,this.height);
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

    /******************************************************************************/

    return {
            Canvas : Canvas
        }
    
});
