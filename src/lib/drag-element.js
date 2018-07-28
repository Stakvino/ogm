define(function (require) {
  const DOM = require('helper').DOM;
  const arrayFromObj = require('helper').array.fromObj;
  
  const leftMouseClick = 1;

  let isInsideCanvas = false;
  let gridPosition = null;
  //Event hundler that makes the dragged element follow the mouse position
  function dragElement(element, mapCanvas, map, img = null){
    document.body.appendChild(element);
    return (e) => {
            const canvasBounding = mapCanvas.DOMCanvas.getBoundingClientRect();
            const canvasPosition = new Vector(canvasBounding.left + window.scrollX , canvasBounding.top + window.scrollY);
            const mousePosition = new Vector(e.pageX, e.pageY);
            const canvasSize = new Vector(mapCanvas.width, mapCanvas.height);      
      
            if( mousePosition.isInsideRect(canvasPosition, canvasSize) ){
              const positionInCanvas = new Vector(mousePosition.x - canvasPosition.x, mousePosition.y - canvasPosition.y);
              gridPosition = new Vector(Math.floor(positionInCanvas.x/mapCanvas.gridWidth), Math.floor(positionInCanvas.y/mapCanvas.gridHeight) );
              gridPosition = new Vector(gridPosition.x * mapCanvas.gridWidth, gridPosition.y * mapCanvas.gridHeight);

              element.style.left = `${canvasPosition.x + gridPosition.x}px`;
              element.style.top  = `${canvasPosition.y + gridPosition.y}px`;
              isInsideCanvas = true;
              //user is holding left mouse click in canvas
              if(e.buttons === leftMouseClick){
                if(img === null){
                  eraseElement(mapCanvas, map)(e);
                }
                else{
                  drawElement(img, mapCanvas, map)();
                }
              }
            }else{
              element.style.left = `${mousePosition.x - mapCanvas.gridWidth/2}px`;
              element.style.top  = `${mousePosition.y - mapCanvas.gridHeight/2}px`;
              if(isInsideCanvas){
                isInsideCanvas = false;
              }
            }
          }
  }
  
  //Handle the mouse click if you are dragging an element
  function drawElement(img, mapCanvas, map){
    return () => {
            if(isInsideCanvas){
              const gridNumber = new Vector(gridPosition.x/mapCanvas.gridWidth, gridPosition.y/mapCanvas.gridHeight);
              const spriteName = img.src.match(/[^\/]+$/)[0];
              
              if(map.array[gridNumber.x][gridNumber.y] !== spriteName){
               const drawArgs = {
                img : img,
                x   : gridPosition.x,
                y   : gridPosition.y,
                width  : img.width,
                height : img.height
               };
               mapCanvas.drawImage(drawArgs);
               //update map array using the name of the img
               map.array[gridNumber.x][gridNumber.y] = spriteName;
               map.isSaved = false;
              }
            }
          }
  }
  
  function eraseElement(mapCanvas, map){
    return (e) => {
      e.preventDefault();
      if(isInsideCanvas){
        const gridNumber = new Vector(gridPosition.x/mapCanvas.gridWidth, gridPosition.y/mapCanvas.gridHeight);
        if(map.array[gridNumber.x][gridNumber.y] !== "empty"){
          mapCanvas.clearGrid(gridPosition);
          mapCanvas.drawGridLine(gridPosition);
          //update map array with the value empty
          map.array[gridNumber.x][gridNumber.y] = "empty";
          map.isSaved = false;
        }
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
  
  return {
    dragElement  : dragElement,
    drawElement  : drawElement,
    eraseElement : eraseElement,
    cancelDrag   : cancelDrag
  }
});
