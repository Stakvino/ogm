define(function (require) {
  const Canvas = require('canvas').Canvas;
  const DOM = require('helper').DOM;
  const array = require('helper').array;

  const mapBlock = DOM.getElementByClassName("Map-block");
  const mapInfo = DOM.getElementByClassName("map-info", mapBlock);
  const mapList = DOM.getElementByClassName("map-list", mapBlock)
  const mapEdit = DOM.getElementByClassName("map-edit", mapBlock)
  
  const messageWarning = DOM.getElementByClassName("warning-message", mapInfo);
  const canvasBlock = DOM.getElementByClassName("canvas-block", mapBlock);
  const mapSprites  = DOM.getElementByClassName("map-sprites", mapBlock);
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
  let canvasSize = null;
  let isInsideCanvas = false;
  let gridPosition = null;
  /*clicking on create button in map-info window will check canvas dimensions entered by user and then create a new map if the values are acceptables*/
  const createBut = DOM.getElementByClassName("create-map", mapBlock);
  createBut.addEventListener("click",() => {
    //canvas dimension smaller then 20 or greater then 20000 or empty
    const canvasDimensions = array.fromHtmlCol( mapBlock.getElementsByClassName("canvas-dimension-input") ).map(e => e.value);
    const canvasWrongDimension = canvasDimensions.filter(e => e < 20 || e > 20000 || e === "").length;
    //grid dimension smaller then 20 or greater then 2000 or empty
    const gridDimensions = array.fromHtmlCol( mapBlock.getElementsByClassName("grid-dimension-input") ).map(e => e.value);
    const gridWrongDimension = gridDimensions.filter(e => e < 10 || e > 2000 || e === "").length;
    
    /*clicking on the create button on the map-info window will check if all dimensions are correctly typed and then create a new canvas with these dimensions*/
    if(canvasWrongDimension){
       messageWarning.textContent = "Wrong canvas dimensions";
       return;
    }
    if(gridWrongDimension){
       messageWarning.textContent = "Wrong grid dimensions";
       return;
    }

    //remove old canvas if it's there
    if(canvasBlock.firstChild){
      canvasBlock.removeChild(canvasBlock.firstChild);
    }
    
    //create and append new map canvas
    const canvasWidth  = Number(canvasDimensions[0]);
    const canvasHeight = Number(canvasDimensions[1]);
    const gridWidth  = Number(gridDimensions[0]);
    const gridHeight = Number(gridDimensions[1]);
    mapCanvas = new Canvas(canvasWidth, canvasHeight, gridWidth, gridHeight);
    canvasBlock.appendChild(mapCanvas.DOMCanvas);
    canvasSize = new Vector(mapCanvas.width, mapCanvas.height);
    mapCanvas.DOMCanvas.classList.add("map-canvas");
    mapCanvas.drawGridLines();

    const oldSprites = mapSprites.getElementsByTagName("div");
    if(oldSprites.length){
      for(let i = 0; i < oldSprites.length; i++){
        mapSprites.removeChild(oldSprites[i]);
      }
    }
    
    DOM.showAndHide({hideElement : mapList});
    DOM.showAndHide({showElement : mapEdit, hideElement : mapInfo});
  });
  
  /*Map tool-box event handlers*/
  //Clear map button
  const clearMapBut = DOM.getElementByClassName("clear-map-but", mapBlock);
  clearMapBut.addEventListener("click", () => {
    mapCanvas.clear();
    mapCanvas.drawGridLines();
  });
  
  //Clear grid button
  const clearGridBut = DOM.getElementByClassName("clear-grid-but", mapBlock);
  clearGridBut.addEventListener("click", () => {
    const whiteDiv = DOM.createElement("div", {className : "draged-element"});
    whiteDiv.style.width  = mapCanvas.gridWidth + "px";
    whiteDiv.style.height = mapCanvas.gridHeight + "px";

    const dragCallback   = dragElement(whiteDiv);
    const drawCallback   = () => {
      if(isInsideCanvas){
        mapCanvas.clearGrid(gridPosition);
        mapCanvas.drawGridLine(gridPosition);
      }
    };
    const cancelCallback = cancelDrag(whiteDiv, dragCallback, drawCallback);

    addEventListener("mousemove", dragCallback);
    addEventListener("click", drawCallback);
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
  
  //Event hundler that makes the dragged element follow the mouse position
  function dragElement(element){
    document.body.appendChild(element);
    return (e) => {
            const canvasBounding = mapCanvas.DOMCanvas.getBoundingClientRect();
            const canvasPosition = new Vector(canvasBounding.left + window.scrollX , canvasBounding.top + window.scrollY);
            const mousePosition = new Vector(e.pageX, e.pageY);

            if( mousePosition.isInsideRect(canvasPosition, canvasSize) ){
              const positionInCanvas = new Vector(e.pageX - canvasPosition.x, e.pageY - canvasPosition.y);
              gridPosition = new Vector(Math.floor(positionInCanvas.x/mapCanvas.gridWidth), Math.floor(positionInCanvas.y/mapCanvas.gridHeight) );
              gridPosition = new Vector(gridPosition.x * mapCanvas.gridWidth, gridPosition.y * mapCanvas.gridHeight);

              element.style.left = `${canvasPosition.x + gridPosition.x}px`;
              element.style.top  = `${canvasPosition.y + gridPosition.y}px`;
              isInsideCanvas = true;
            }else{
              element.style.left = `${e.pageX - mapCanvas.gridWidth/2}px`;
              element.style.top  = `${e.pageY - mapCanvas.gridHeight/2}px`;
              isInsideCanvas = false;
            }
          }
  }
  //Handle the mouse click if you are dragging an element
  function drawElement(img){
    return (e) => {
            if(isInsideCanvas){
              const drawArgs = {
                img : img,
                x   : gridPosition.x,
                y   : gridPosition.y,
                width  : img.width,
                height : img.height
              };
              mapCanvas.drawImage(drawArgs);
            }
          }
  }
  //Pressing Escape will remove dragged element and hes handlers 
  function cancelDrag(element, dragCallback, drawCallback){
    //Give the callback a name in this one to be able to use it as reference inside
    return function cancelCallback(e) {
                if(e.key === "Escape"){
                  document.body.removeChild(element);
                  removeEventListener("mousemove", dragCallback);
                  removeEventListener("click", drawCallback);
                  removeEventListener("keydown", cancelCallback);
                  isInsideCanvas = false;
              }
            }
  }
  
  //Load images from the background folder to use as map sprites when load map sprite button is clicked
  addSprite.addEventListener("input",function() {
    const files = this.files;
    //Create a sprite-block for each selected img and add them to the list
    for(let file of files){
      const path  = "img/background/" + file.name;
      const div   = DOM.createElement("div", {className : "sprite-block"});
      const img   = DOM.createElement("img", {src : path, width : 40, height : 40});
      const label = DOM.createElement("label", {className : "not-selectable-text"});
      label.textContent = file.name;
      
      //Attach event handler to be able to drag the sprite when added to the list
      div.addEventListener("click",function(e){
        const dragedImg = DOM.createElement("img", {src : path, width : mapCanvas.gridWidth, height : mapCanvas.gridHeight});
        dragedImg.classList.add("draged-element");
        dragedImg.style.top  = `${e.pageY - mapCanvas.gridHeight/2}px`;
        dragedImg.style.left = `${e.pageX - mapCanvas.gridWidth/2}px`;
        
        const dragCallback   = dragElement(dragedImg);
        const drawCallback   = drawElement(dragedImg);
        const cancelCallback = cancelDrag(dragedImg, dragCallback, drawCallback);
        
        addEventListener("mousemove", dragCallback);
        addEventListener("click", drawCallback);
        addEventListener("keydown", cancelCallback);
      });
      
      //Add loaded sprite to the list when img finished laoding 
      img.addEventListener("load",function(){
        DOM.appendChildren(div, [img, label]);
        mapSprites.insertBefore(div, addSprite);
      }); 
    }
  });
  
});