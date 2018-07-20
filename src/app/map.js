define(function (require) {
  const Canvas = require('canvas').Canvas;
  const DOM = require('helper').DOM;
  const array = require('helper').array;
  const dragElement  = require(`drag-element`).dragElement;
  const drawElement  = require(`drag-element`).drawElement;
  const eraseElement = require(`drag-element`).eraseElement;
  const cancelDrag   = require(`drag-element`).cancelDrag;
  
  const mapBlock = DOM.getElementByClassName("Map-block");
  const mapInfo = DOM.getElementByClassName("map-info", mapBlock);
  const mapList = DOM.getElementByClassName("map-list", mapBlock)
  const mapEdit = DOM.getElementByClassName("map-edit", mapBlock)
  
  const messageWarning = DOM.getElementByClassName("warning-message", mapInfo);
  const canvasBlock = DOM.getElementByClassName("canvas-block", mapBlock);
  const mapSprites  = DOM.getElementByClassName("map-sprites", mapBlock);
  const spritesContainer = DOM.getElementByClassName("sprites-container", mapBlock);
  const addSprite = document.getElementById("load_map_sprite");
  const dimensionsInput = array.fromHtmlCol( mapInfo.getElementsByTagName("input") );
  
  //clicking on create new map button will show the map-info window
  const createNewMapBut = DOM.getElementByClassName("create-new-map", mapBlock);
  createNewMapBut.addEventListener("click",() => {
    //dimensionsInput.forEach( dimensionInput => dimensionInput.value = "" );
    messageWarning.textContent = "";
    DOM.showAndHide({showElement : mapInfo});
  });
  

  /* Make sure canvas width,height and grid width,height inputs are all numbers 
     using javascript to avoid firefox number input bug */
  for(let dimensionInput of dimensionsInput){
    dimensionInput.addEventListener("keydown",function(e){
      const input = e.key;
      //only numbers are allowed in canvas dimensions input , and backspace to delete
      if( !/[0-9]/.test(input) && e.key !== "Backspace" ){
        e.preventDefault();
      }
    });
  }
  
  let mapCanvas = null;
  /*clicking on create button in map-info window will check canvas dimensions entered by user and then create a new map if the values are acceptables*/
  const createBut = DOM.getElementByClassName("create-map", mapBlock);
  createBut.addEventListener("click",() => {
    //canvas dimension smaller then 20 or greater then 5000 or empty
    const canvasDimensions = array.fromHtmlCol( mapBlock.getElementsByClassName("canvas-dimension-input") ).map(e => e.value);
    const canvasWrongDimension = canvasDimensions.filter(e => e < 20 || e > 5000 || e === "").length;
    //grid dimension smaller then 20 or greater then 200 or empty
    const gridDimensions = array.fromHtmlCol( mapBlock.getElementsByClassName("grid-dimension-input") ).map(e => e.value);
    const gridWrongDimension = gridDimensions.filter(e => e < 10 || e > 200 || e === "").length;

    /*clicking on the create button on the map-info window will check if all dimensions are correctly typed and then create a new canvas with these dimensions*/
    if(canvasWrongDimension){
     messageWarning.textContent = "canvas dimensions must be between 20 and 5000";
     return;
    }
    if(gridWrongDimension){
     messageWarning.textContent = "grid dimensions must be between 10 and 200";
     return;
    }
    
    const canvasWidth  = Number(canvasDimensions[0]);
    const canvasHeight = Number(canvasDimensions[1]);
    const gridWidth  = Number(gridDimensions[0]);
    const gridHeight = Number(gridDimensions[1]);
    
    if(gridWidth > canvasWidth || gridHeight > canvasHeight){
      messageWarning.textContent = "grid dimensions must be smaller then canvas dimensions";
      return;
    }

    //remove old canvas if it's there
    if(canvasBlock.firstChild){
      canvasBlock.removeChild(canvasBlock.firstChild);
    }
    
    //create and append new map canvas
    mapCanvas = new Canvas(canvasWidth, canvasHeight, gridWidth, gridHeight);
    canvasBlock.appendChild(mapCanvas.DOMCanvas);
    mapCanvas.DOMCanvas.classList.add("map-canvas");
    mapCanvas.drawGridLines();

    const oldSprites = spritesContainer.children;
    if(oldSprites.length){
      for(let i = 0; i < oldSprites.length; i++){
        spritesContainer.removeChild(oldSprites[i]);
      }
    }
    
    DOM.showAndHide({hideElement : mapList});
    DOM.showAndHide({showElement : mapEdit, hideElement : mapInfo});
  });
  
  /*Map tool-box event handlers*/
  //Clear map button
  const clearMapBut = DOM.getElementByClassName("clear-map-but", mapBlock);
  clearMapBut.addEventListener("click", () => {
    const clearConfirmed = confirm("Do you want to delete all map ? unsaved progress will be lost");
    if(clearConfirmed){
      mapCanvas.clear();
      mapCanvas.drawGridLines();
    }
  });
  
  //Clear grid button
  const clearGridBut = DOM.getElementByClassName("clear-grid-but", mapBlock);
  clearGridBut.addEventListener("click", (e) => {
    const whiteDiv = DOM.createElement("div", {className : "draged-element"});
    whiteDiv.style.width  = mapCanvas.gridWidth + "px";
    whiteDiv.style.height = mapCanvas.gridHeight + "px";
    whiteDiv.style.left = `${e.pageX - mapCanvas.gridWidth/2}px`;
    whiteDiv.style.top  = `${e.pageY - mapCanvas.gridHeight/2}px`;
    
    const dragCallback   = dragElement(whiteDiv, mapCanvas);
    const eraseCallback  = eraseElement(mapCanvas);
    const cancelCallback = cancelDrag(whiteDiv, dragCallback, eraseCallback);

    addEventListener("mousemove", dragCallback);
    addEventListener("mousedown", eraseCallback);
    addEventListener("keydown", cancelCallback);
  });
  
  //clicking on the cancel button on the map-info window will just hide this window
  const cancelBut = DOM.getElementByClassName("cancel-map", mapBlock);
  cancelBut.addEventListener("click",() => {
    DOM.showAndHide({hideElement : mapInfo});
  });

  //clicking on the map list button will get you back to the map list block
  const returnToMapListBut = DOM.getElementByClassName("return-map-list", mapBlock);
  returnToMapListBut.addEventListener("click",() => {
    DOM.showAndHide({showElement : mapList, hideElement : mapEdit});
  });
  
  //Load images from the background folder to use as map sprites when load map sprite button is clicked
  addSprite.addEventListener("input",function() {
    const files = this.files;
    //Create a sprite-block for each selected img and add them to the list
    for(let file of files){
      const path  = "img/background/" + file.name;
      const spriteBlock = DOM.createElement("div", {className : "sprite-block"});
      const mapSprite = DOM.createElement("div", {className : "map-sprite"});
      mapSprite.style.backgroundImage = `url(${path})`;
      const label = DOM.createElement("label", {className : "not-selectable-text"});
      label.textContent = file.name;
      
      //make the sprite block that contains the sprite img and the name
      DOM.appendChildren(spriteBlock, [mapSprite, label]);
      spritesContainer.appendChild(spriteBlock);

      //Attach event handler to be able to drag the sprite when added to the list
      spriteBlock.addEventListener("click",function(e){
        const dragedSprite = DOM.createElement("div", {className : "draged-element"});
        dragedSprite.style.backgroundImage = `url(${path})`;
        dragedSprite.style.width  = mapCanvas.gridWidth  + "px";
        dragedSprite.style.height = mapCanvas.gridHeight + "px";
        dragedSprite.style.top  = `${e.pageY - mapCanvas.gridHeight/2}px`;
        dragedSprite.style.left = `${e.pageX - mapCanvas.gridWidth/2}px`;
        
        const img = DOM.createElement("img", {src : path, width : mapCanvas.gridWidth, height : mapCanvas.gridHeight});
        const dragCallback   = dragElement(dragedSprite, mapCanvas, img);
        const drawCallback   = drawElement(img, mapCanvas);
        const cancelCallback = cancelDrag(dragedSprite, dragCallback, drawCallback);
        
        addEventListener("mousemove", dragCallback);
        addEventListener("click", drawCallback);
        addEventListener("keydown", cancelCallback);
      });
    }
  });
  
});