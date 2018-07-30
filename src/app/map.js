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
  const mapInfoWarning = DOM.getElementByClassName("map-info-warning", mapInfo);
  const mapList = DOM.getElementByClassName("map-list", mapBlock);
  const createdMaps = DOM.getElementByClassName("created-maps", mapList);
  const mapEdit = DOM.getElementByClassName("map-edit", mapBlock);
  
  const canvasBlock = DOM.getElementByClassName("canvas-block", mapBlock);
  const mapSprites  = DOM.getElementByClassName("map-sprites", mapBlock);
  const spritesContainer = DOM.getElementByClassName("sprites-container", mapBlock);
  const addSprite = document.getElementById("load_map_sprite");
  const createMapInput = array.fromHtmlCol( mapInfo.getElementsByTagName("input") );
  const resizeMapInfo = DOM.getElementByClassName("resize-info", mapBlock);
  const resizeInputs = array.fromHtmlCol( resizeMapInfo.getElementsByTagName("input") );
  
  //clicking on create new map button will show the map-info window
  const createNewMapBut = DOM.getElementByClassName("create-new-map", mapBlock);
  createNewMapBut.addEventListener("click",() => {
    //createMapInput.forEach( dimensionInput => dimensionInput.value = "" );
    mapInfoWarning.textContent = "";
    DOM.showAndHide({showElement : mapInfo});
    createMapInput[0].focus();
  });
  

  /* Make sure canvas width,height and grid width,height inputs are all numbers 
     using javascript to avoid firefox number input bug */
  for( let dimensionInput of createMapInput.concat(resizeInputs) ){
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
  const createBut = DOM.getElementByClassName("create-map", mapInfo);
  createBut.addEventListener("click",() => {
    //canvas dimension smaller then 20 or greater then 5000 or empty
    const canvasDimensions = array.fromHtmlCol( mapInfo.getElementsByClassName("canvas-dimension-input") ).map(e => e.value);
    const canvasWrongDimension = canvasDimensions.filter(e => e < 20 || e > 5000 || e === "").length;
    //grid dimension smaller then 20 or greater then 200 or empty
    const gridDimensions = array.fromHtmlCol( mapInfo.getElementsByClassName("grid-dimension-input") ).map(e => e.value);
    const gridWrongDimension = gridDimensions.filter(e => e < 10 || e > 200 || e === "").length;

    /*clicking on the create button on the map-info window will check if all dimensions are correctly typed and then create a new canvas with these dimensions*/
    if(canvasWrongDimension){
     mapInfoWarning.textContent = "canvas dimensions must be between 20 and 5000";
     return;
    }
    if(gridWrongDimension){
     mapInfoWarning.textContent = "grid dimensions must be between 10 and 200";
     return;
    }
    
    const canvasWidth  = Number(canvasDimensions[0]);
    const canvasHeight = Number(canvasDimensions[1]);
    const gridWidth  = Number(gridDimensions[0]);
    const gridHeight = Number(gridDimensions[1]);
    
    if(gridWidth > canvasWidth || gridHeight > canvasHeight){
      mapInfoWarning.textContent = "grid dimensions must be smaller then canvas dimensions";
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
    const numberOfRaws = Math.floor(mapCanvas.height/mapCanvas.gridHeight);
    const numberOfCol  = Math.floor(mapCanvas.width/mapCanvas.gridWidth);
    const mapArray = array.create(numberOfRaws, numberOfCol, "empty");
    const mapSize  = new Vector(canvasWidth, canvasHeight);
    const gridSize = new Vector(gridWidth, gridHeight);
    map = new Map(mapArray, mapSize, gridSize);

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
  
  //resize map
  const resizeMapBut = DOM.getElementByClassName("resize-map-but", toolBox);
  const resizeInfoWarning = DOM.getElementByClassName("resize-info-warning", resizeMapInfo);
  const confirmResizeBut = DOM.getElementByClassName("resize-map", resizeMapInfo);
  
  resizeMapBut.addEventListener("click", () => {
    resizeInputs[0].value = mapCanvas.width;
    resizeInputs[1].value = mapCanvas.height;
    resizeInputs[2].value = mapCanvas.gridWidth;
    resizeInputs[3].value = mapCanvas.gridHeight;
    DOM.showAndHide({showElement : resizeMapInfo});
    resizeInputs[0].focus();
  });
  
  confirmResizeBut.addEventListener("click", () => {
    const canvasDimensions = array.fromHtmlCol( resizeMapInfo.getElementsByClassName("canvas-dimension-input") ).map(e => e.value);
    const gridDimensions = array.fromHtmlCol( resizeMapInfo.getElementsByClassName("grid-dimension-input") ).map(e => e.value);

    const canvasWidth  = Number(canvasDimensions[0]);
    const canvasHeight = Number(canvasDimensions[1]);
    const gridWidth  = Number(gridDimensions[0]);
    const gridHeight = Number(gridDimensions[1]);
    
    if(gridWidth > canvasWidth || gridHeight > canvasHeight){
      resizeInfoWarning.textContent = "grid dimensions must be smaller then canvas dimensions";
      return;
    }
    
    const rowsNumber = Math.floor(canvasHeight/gridHeight);
    const columnsNumber = Math.floor(canvasWidth/gridWidth);
    
    let newMapArray   = map.array;
    const newGridSize = new Vector(gridWidth, gridHeight);
    const newMapSize  = new Vector(canvasWidth, canvasHeight);
    
    if(rowsNumber > map.rowsNumber){
      const diff = rowsNumber - map.rowsNumber;
      newMapArray = newMapArray.concat( array.create(diff, map.array[0].length, "empty") );
    }
    else{
      newMapArray = newMapArray.slice(0, rowsNumber);   
    }
    
    if(columnsNumber > map.columnsNumber){
      const diff = columnsNumber - map.columnsNumber;
      newMapArray = newMapArray.map( e => e.concat( array.create(diff, 0, "empty") ) );
    }
    else{
      newMapArray = newMapArray.map( e => e.slice(0, columnsNumber) ); 
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
    mapCanvas.drawMap(map.array);
    
    map = new Map(newMapArray, newMapSize, newGridSize, map.name);
    map.isSaved = false;

    DOM.showAndHide({hideElement : resizeMapInfo});
  });
  
  const cancelResizeBut = DOM.getElementByClassName("cancel-resize", mapBlock);
  cancelResizeBut.addEventListener("click",() => {
    DOM.showAndHide({hideElement : resizeMapInfo});
  });
  resizeMapInfo.addEventListener("keydown", (e) => {
    if(e.key === "Escape"){
      DOM.showAndHide({hideElement : resizeMapInfo});
    }
  });
  
  //save map
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
  
  const confirmSaveBut = DOM.getElementByClassName("confirm-save-but", saveMapConfirm);
  confirmSaveBut.addEventListener("click", () => {
    const mapName = mapNameInput.value.trim();
    if(mapName === ""){
      return;
    }
    
    const gridSize = new Vector(mapCanvas.gridWidth, mapCanvas.gridHeight);
    const createdMapBlock = createMapBlock(map);

    if( map.isAlreadyInLocal(mapName) ){
      const saveConfirmed = confirm("This map already exists in your list. do you wana change it ?");
      if(saveConfirmed){
        //get the map block that will be replaced
        const savedMapBlock = array.fromHtmlCol( createdMaps.children ).filter(function(e){
          const currentMapName = DOM.getElementByClassName("map-name", e).textContent;
          return currentMapName === mapName;
        })[0];
        //replace old map block with the new one
        createdMaps.replaceChild(createdMapBlock, savedMapBlock);
        map.name = mapName;
        map.saveInLocal();
        map.isSaved = true;
      }
    }
    else{
      createdMaps.appendChild(createdMapBlock);
      map.name = mapName;
      map.saveInLocal();
      map.isSaved = true;
    }
  
    DOM.showAndHide({hideElement : saveMapConfirm});
  });
  
  const cancelSaveBut  = DOM.getElementByClassName("cancel-save-but", saveMapConfirm);
  cancelSaveBut.addEventListener("click", () => DOM.showAndHide({hideElement : saveMapConfirm}) );
  
  //clicking on the cancel button on the map-info window will just hide this window
  const cancelCreateBut = DOM.getElementByClassName("cancel-map", mapInfo);
  cancelCreateBut.addEventListener("click",() => {
    DOM.showAndHide({hideElement : mapInfo});
  });
  mapInfo.addEventListener("keydown", (e) => {
    if(e.key === "Escape"){
      DOM.showAndHide({hideElement : mapInfo});
    }
  });
  
  //clicking on the map list button will get you back to the map list block
  const returnToMapListBut = DOM.getElementByClassName("return-map-list", mapEdit);
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
    const mapSize  = savedMaps[mapName].mapSize;
    const gridSize = savedMaps[mapName].gridSize;
    const map = new Map(mapArray, mapSize, gridSize, mapName);
    
    const createdMapBlock = createMapBlock(map);
    createdMaps.appendChild(createdMapBlock);
  }
  
  function createMapBlock(map){
    const createdMapBlock = document.createElement("tr");
    /*create small img for the saved map using canvas */
    const iconMapArray = map.array.slice(0, 10).map( e => e.slice(0, 10) );
    const iconCanvas = new Canvas(100, 100, 10, 10);
    iconCanvas.drawMap(iconMapArray);
    iconCanvas.DOMCanvas.className = "map-small";
    /**/
    const nameLabel = DOM.createElement("td", {className : "map-name ellipsis-text", textContent : map.name});
    const mapSizeLabel = DOM.createElement("td", {className : "map-size", textContent : `${map.size.x}x${map.size.y}`});
    const gridSizeLabel = DOM.createElement("td", {className : "grid-size", textContent : `${map.gridSize.x}x${map.gridSize.y}`});
    const openButton = DOM.createElement("button", {className : "open-map-but", textContent : "open"});
    const deleteButton = DOM.createElement("button", {className : "delete-map-but", textContent : "delete"});
    
    openButton.addEventListener("click", function(){
      const savedMaps  = JSON.parse( localStorage.getItem("savedMaps") );
      const selectedTr = this.parentElement.parentElement;
      const mapName  = DOM.getElementByClassName("map-name", selectedTr).textContent;
      const mapArray = savedMaps[mapName].mapArray;
      const mapSize = savedMaps[mapName].mapSize;
      const gridSize = savedMaps[mapName].gridSize;
      
      map = new Map(mapArray, mapSize, gridSize, mapName);
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