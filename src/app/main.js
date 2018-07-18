const mouseLeftButton  = 0;
const mouseRightButton = 2;

const tabSelectors   = document.querySelector("div.tab-selectors");
const editBlocks     = document.querySelector("div.edit-blocks");
const messageWarning = document.querySelector("div.warning-message");
const canvasBlock = document.querySelector("div.canvas-block");
const mapSprites = document.querySelector("div.map-sprites");
const addSprite  = document.querySelector(`button[name="add map sprite"]`);
const dimensionsInput = Array.from( document.querySelectorAll(`div.map-info input[type="text"]`) );

define(function (require) {
  const Canvas = require('canvas').Canvas;

  //switching tabs event handler
  tabSelectors.querySelectorAll("div.tab-selector").forEach(function(tabSelector){

    tabSelector.addEventListener("click",function(){
      //Remove selected style from the current selected tab
      tabSelectors.querySelector("div.selected-tab").classList.remove("selected-tab");

      //hide the current selected block
      const currentEditBlock = document.querySelector("div.edit-blocks > div.show");
      currentEditBlock.classList.remove("show");
      currentEditBlock.classList.add("hide");

      //add selected style to the clicked tab
      this.classList.add("selected-tab");

      //get the selected edit block
      const indexOfTab = Array.from(tabSelectors.children).indexOf(this);
      const selectedEditBlock = Array.from(editBlocks.children)[indexOfTab];
      //show the selected edit block
      selectedEditBlock.classList.remove("hide");
      selectedEditBlock.classList.add("show");
    });

  });

  //remove default dotted outline when button is focused with js to avoid firefox bug
  document.querySelectorAll("button").forEach( (button) => {
    button.addEventListener("mousedown",function(){
      this.style.outline = "none";
    });
  });


  //clicking on create new map button will show the edit map block
  document.querySelector(`button[name="create map"]`).addEventListener("click",() => {
    //dimensionsInput.forEach( dimensionInput => dimensionInput.value = "" );
    messageWarning.textContent = "";
    const mapInfo = document.querySelector("div.map-info");
    DOM.showAndHide({showElement : mapInfo});
  });
  

  /* Make sure canvas width,height and grid width,height inputs are all numbers 
     using javascript to avoid firefox number input bug */
  for(let dimensionInput of dimensionsInput){
    dimensionInput.addEventListener("keydown",function(e){
      const input = e.key;
      if( !/[0-9]/.test(input) && e.key !== "Backspace" ){
        e.preventDefault();
      }
    });
  }
  
  let mapCanvas = null;
  let canvasSize = null;
  let isInsideCanvas = false;
  let gridPosition = null;
  //clicking on create new map button will load map-info window
  document.querySelector(`div.map-info button[name="create"]`).addEventListener("click",() => {
    //canvas dimension smaller then 20 or greater then 20000 or empty
    const canvasDimensions = Array.from( document.querySelectorAll(`div.map-info div`)[0].querySelectorAll("input") ).map(e => e.value);
    const canvasWrongDimension = canvasDimensions.filter(e => e < 20 || e > 20000 || e === "").length;
    //grid dimension smaller then 20 or greater then 2000 or empty
    const gridDimensions = Array.from( document.querySelectorAll(`div.map-info div`)[1].querySelectorAll("input") ).map(e => e.value);
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

    const oldSprites = mapSprites.querySelectorAll("div");
    if(oldSprites.length){
      for(let i = 0; i < oldSprites.length; i++){
        mapSprites.removeChild(oldSprites[i]);
      }
    }

    const mapList = document.querySelector("div.map-list");
    DOM.showAndHide({hideElement : mapList});

    const mapEdit = document.querySelector("div.map-edit");
    const mapInfo = document.querySelector("div.map-info");
    DOM.showAndHide({showElement : mapEdit, hideElement : mapInfo});
  });
  
  /*Map tool-box event handlers*/
  //Clear map button
  document.querySelector(`button[title="clear map"]`).addEventListener("click", () => {
    mapCanvas.clear();
    mapCanvas.drawGridLines();
  });
  
  //Clear grid button
  document.querySelector(`button[title="clear grid"]`).addEventListener("click", () => {
    const whiteDiv = DOM.createElement("div");
    whiteDiv.style.width  = mapCanvas.gridWidth + "px";
    whiteDiv.style.height = mapCanvas.gridHeight + "px";
    whiteDiv.classList.add("draged-element");

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
  document.querySelector(`div.map-info button[name="cancel"]`).addEventListener("click",() => {
    const mapInfo = document.querySelector("div.map-info");
    DOM.showAndHide({hideElement : mapInfo});
  });

  //clicking on the map list button will get you back to the map list block
  document.querySelector(`button[name="map list"]`).addEventListener("click",() => {
    const mapList = document.querySelector("div.map-list");
    const mapEdit = document.querySelector("div.map-edit");
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
  document.getElementById("load_map_sprite").addEventListener("input",function() {
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


