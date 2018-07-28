define(function (require) {
  const Canvas = require('canvas').Canvas;
  const DOM = require('helper').DOM;
  const debounce = require('helper').debounce;
  const array = require('helper').array;
  const Map = require('helper').Map;
  const dragElement  = require(`drag-element`).dragElement;
  const drawElement  = require(`drag-element`).drawElement;
  const eraseElement = require(`drag-element`).eraseElement;
  const cancelDrag   = require(`drag-element`).cancelDrag;
  
  const mapBlock = DOM.getElementByClassName("Map-block");
  const mapInfo = DOM.getElementByClassName("map-info", mapBlock);
  const mapList = DOM.getElementByClassName("map-list", mapBlock);
  const createdMaps = DOM.getElementByClassName("created-maps", mapList);
  const mapEdit = DOM.getElementByClassName("map-edit", mapBlock);
  
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
  let map = null;
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
    const mapArray = array.create(mapCanvas.gridsNumber.x, mapCanvas.gridsNumber.y, "empty");
    const gridSize = new Vector(gridWidth, gridHeight);
    map = new Map(mapArray, gridSize);

    const oldSprites = array.fromHtmlCol( spritesContainer.children );
    if(oldSprites.length){
      for(let i = 0; i < oldSprites.length; i++){
        spritesContainer.removeChild(oldSprites[i]);
      }
    }
    
    DOM.showAndHide({hideElement : mapList});
    DOM.showAndHide({showElement : mapEdit, hideElement : mapInfo});
  });
  
  /*Map tool-box event handlers*/
  const canvasEdit = DOM.getElementByClassName("canvas-edit", mapBlock);
  const toolBox = DOM.getElementByClassName("map-toolbox", canvasEdit);
  //Clear map button
  const clearMapBut = DOM.getElementByClassName("clear-map-but", toolBox);
  clearMapBut.addEventListener("click", () => {
    if( map.isEmpty() ){
      return;
    }
    const clearConfirmed = confirm("Do you want to delete all map ? unsaved progress will be lost");
    if(clearConfirmed){
      mapCanvas.clear();
      mapCanvas.drawGridLines();
      map.clear();
    }
  });
  
  //Clear grid button
  const clearGridBut = DOM.getElementByClassName("clear-grid-but", toolBox);
  clearGridBut.addEventListener("click", (e) => {
    const whiteDiv = DOM.createElement("div", {className : "draged-element"});
    whiteDiv.style.width  = mapCanvas.gridWidth + "px";
    whiteDiv.style.height = mapCanvas.gridHeight + "px";
    whiteDiv.style.left = `${e.pageX - mapCanvas.gridWidth/2}px`;
    whiteDiv.style.top  = `${e.pageY - mapCanvas.gridHeight/2}px`;
    
    const dragCallback   = debounce(dragElement(whiteDiv, mapCanvas, map), 50);
    const eraseCallback  = eraseElement(mapCanvas, map);
    const cancelCallback = cancelDrag(whiteDiv, dragCallback, eraseCallback);

    addEventListener("mousemove", dragCallback);
    addEventListener("mousedown", eraseCallback);
    addEventListener("keydown", cancelCallback);
  });
  
  //elements used in the prosses of map saving
  const saveMapConfirm = DOM.getElementByClassName("save-map-confirm", canvasEdit);
  const mapNameInput   = saveMapConfirm.getElementsByTagName("input")[0];
  
  //save map event handlers
  const saveMapBut = DOM.getElementByClassName("save-map-but", toolBox);
  saveMapBut.addEventListener("click",() => {
    //if this map is already named suggest the same name to erase save
    if(map.name){
      mapNameInput.value = map.name;
    }
    DOM.showAndHide({showElement : saveMapConfirm});
    mapNameInput.focus();
  });
  
  const confirmSaveMap = DOM.getElementByClassName("confirm-save-map", saveMapConfirm);
  confirmSaveMap.addEventListener("click", () => {
    const mapName = mapNameInput.value.trim();
    if(mapName === ""){
      return;
    }

    if( map.isAlreadyInLocal(mapName) ){
      const saveConfirmed = confirm("This map already exists in your list. do you wana change it ?");
      if(saveConfirmed){
        map.name = mapName;
        map.saveInLocal();
        map.isSaved = true;
        
        //replace old map icon and map dimensions by the new one
        const savedMapBlock = array.fromHtmlCol( createdMaps.children ).filter(function(e){
          const currentMapName = DOM.getElementByClassName("map-name", e).textContent;
          return currentMapName === mapName;
        })[0];
        
        const iconMapArray = map.array.slice(0, 10).map( e => e.slice(0, 10) );
        const OldMapIcon = DOM.getElementByClassName("map-small", savedMapBlock);
        const NewMapIcon = new Canvas(100, 100, 10, 10);
        NewMapIcon.DOMCanvas.className = "map-small";
        NewMapIcon.drawMap(iconMapArray);
        savedMapBlock.replaceChild(NewMapIcon.DOMCanvas, OldMapIcon);
        const mapSizeLabel = DOM.getElementByClassName("map-size", savedMapBlock);
        mapSizeLabel.textContent = `${map.size.x}x${map.size.y}`;
      }
    }
    else{
      const gridSize = new Vector(mapCanvas.gridWidth, mapCanvas.gridHeight);
      const createdMapBlock = createMapBlock(map.array, mapName, gridSize, Canvas, createdMaps);
      createdMaps.appendChild(createdMapBlock);
      map.name = mapName;
      map.saveInLocal();
      map.isSaved = true;
    }
  
    DOM.showAndHide({hideElement : saveMapConfirm});
  });
  
  const cancelSaveMap  = DOM.getElementByClassName("cancel-save-map", saveMapConfirm);
  cancelSaveMap.addEventListener("click", () => DOM.showAndHide({hideElement : saveMapConfirm}) );
  
  //clicking on the cancel button on the map-info window will just hide this window
  const cancelBut = DOM.getElementByClassName("cancel-map", mapBlock);
  cancelBut.addEventListener("click",() => {
    DOM.showAndHide({hideElement : mapInfo});
  });

  //clicking on the map list button will get you back to the map list block
  const returnToMapListBut = DOM.getElementByClassName("return-map-list", mapBlock);
  returnToMapListBut.addEventListener("click",() => {
    if(!map.isSaved){
     const confirmReturn = confirm("unsaved changes in map will be lost. Do you want to exit map edit mode anyways ?");
     if(confirmReturn){
       DOM.showAndHide({showElement : mapList, hideElement : mapEdit});
      }
    }
    else{
      DOM.showAndHide({showElement : mapList, hideElement : mapEdit});
    }
  });
  
  //Load images from the background folder to use as map sprites when load map sprite button is clicked
  addSprite.addEventListener("input",function() {
    const files = this.files;
    //Create a sprite-block for each selected img and add them to the list
    for(let file of files){
      const path  = "img/background/" + file.name;
      const spriteBlock = DOM.createElement("div", {className : "sprite-block"});
      const mapSprite = DOM.createElement("div", {className : "map-sprite"});
      mapSprite.style.backgroundImage = `url("${path}")`;
      const label = DOM.createElement("label", {className : "not-selectable-text ellipsis-text"});
      label.textContent = file.name;
      
      //make the sprite block that contains the sprite img and the name
      DOM.appendChildren(spriteBlock, [mapSprite, label]);
      spritesContainer.appendChild(spriteBlock);

      //Attach event handler to be able to drag the sprite when added to the list
      spriteBlock.addEventListener("click",function(e){
        const dragedSprite = DOM.createElement("div", {className : "draged-element"});
        dragedSprite.style.backgroundImage = `url("${path}")`;
        dragedSprite.style.width  = mapCanvas.gridWidth  + "px";
        dragedSprite.style.height = mapCanvas.gridHeight + "px";
        dragedSprite.style.top  = `${e.pageY - mapCanvas.gridHeight/2}px`;
        dragedSprite.style.left = `${e.pageX - mapCanvas.gridWidth/2}px`;
        
        const img = DOM.createElement("img", {src : path, width : mapCanvas.gridWidth, height : mapCanvas.gridHeight});
        const dragCallback   = debounce(dragElement(dragedSprite, mapCanvas, map, img), 50);
        const drawCallback   = drawElement(img, mapCanvas, map);
        const cancelCallback = cancelDrag(dragedSprite, dragCallback, drawCallback);
        
        addEventListener("mousemove", dragCallback);
        addEventListener("click", drawCallback);
        addEventListener("keydown", cancelCallback);
      });
    }
  });
  
  //load all previously saved maps in local storage
  const savedMaps = JSON.parse( localStorage.getItem("savedMaps") ) || {};
  
  for(let mapName in savedMaps){
    const mapArray = savedMaps[mapName].mapArray;
    const gridSize = savedMaps[mapName].gridSize;

    const createdMapBlock = createMapBlock(mapArray, mapName, gridSize, Canvas, createdMaps);
    createdMaps.appendChild(createdMapBlock);
  }
  
  function createMapBlock(mapArray, mapName, gridSize){
    const createdMapBlock = document.createElement("tr");
    /*create small img for the saved map using canvas */
    const iconMapArray = mapArray.slice(0, 10).map( e => e.slice(0, 10) );
    const iconCanvas = new Canvas(100, 100, 10, 10);
    iconCanvas.drawMap(iconMapArray);
    iconCanvas.DOMCanvas.className = "map-small";
    /**/
    const nameLabel = DOM.createElement("td", {className : "map-name ellipsis-text", textContent : mapName});
    const mapSize = new Vector(mapArray.length * gridSize.x, mapArray[0].length * gridSize.y);
    const mapSizeLabel = DOM.createElement("td", {className : "map-size", textContent : `${mapSize.x}x${mapSize.y}`});
    const gridSizeLabel = DOM.createElement("td", {className : "grid-size", textContent : `${gridSize.x}x${gridSize.y}`});
    const openButton = DOM.createElement("button", {className : "open-map-but", textContent : "open"});
    const deleteButton = DOM.createElement("button", {className : "delete-map-but", textContent : "delete"});
    
    openButton.addEventListener("click", function(){
      const savedMaps  = JSON.parse( localStorage.getItem("savedMaps") );
      const selectedTr = this.parentElement.parentElement;
      const mapName = DOM.getElementByClassName("map-name", selectedTr).textContent;
      const mapArray = savedMaps[mapName].mapArray;
      const gridSize = savedMaps[mapName].gridSize;
      map = new Map(mapArray, gridSize, mapName);
      if(canvasBlock.firstChild){
      canvasBlock.removeChild(canvasBlock.firstChild);
      }
      //create and append new map canvas
      mapCanvas = new Canvas(map.size.x, map.size.y, gridSize.x, gridSize.y);
      mapCanvas.DOMCanvas.classList.add("map-canvas");
      mapCanvas.drawGridLines();
      mapCanvas.drawMap(mapArray);
      canvasBlock.appendChild(mapCanvas.DOMCanvas);
      DOM.showAndHide({hideElement : mapList, showElement : mapEdit});
    });
    
    deleteButton.addEventListener("click",function(){
      const deleteConfirmed = confirm(`all data related to the map named "${mapName}" will be lost. Do you want to delete the map anyway ?`);
      
      if(deleteConfirmed){
        const savedMaps = JSON.parse( localStorage.getItem("savedMaps") );
        const selectedTr = this.parentElement.parentElement;
        createdMaps.removeChild(selectedTr);
        delete savedMaps[mapName];
        localStorage.setItem( "savedMaps", JSON.stringify( savedMaps ) );
      }
    });
    
    const smallCanvas = document.createElement("td");
    smallCanvas.appendChild(iconCanvas.DOMCanvas);
    const buttonsTd   = document.createElement("td");
    DOM.appendChildren(buttonsTd, [openButton, deleteButton]);
    
    DOM.appendChildren(createdMapBlock, [smallCanvas, nameLabel, mapSizeLabel, gridSizeLabel, buttonsTd]);
    return createdMapBlock;
  }
  
});