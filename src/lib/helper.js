class Vector {
  constructor(x,y) {
    this.x = x;
    this.y = y;
  }
  plus(vector){
    return new Vector(this.x + vector.x, this.y + vector.y);
  }
  times(number){
    return new Vector(this.x * number, this.y * number);
  }
  magnitude(){
    return Math.sqrt( Math.pow(this.x, 2) +  Math.pow(this.y, 2) );  
  }
  angleBetween(vector){
    const dy = vector.y - this.y;
    const dx = vector.x - this.x;

    return Math.atan2(dy,dx);
  }
  isInsideRect(position, size){
    return this.x > position.x && this.x < position.x + size.x
        && this.y > position.y && this.y < position.y + size.y;
  }
    
}

/******************************************************************************/
//Helpers for DOM manipulation
const DOM = Object.create(null);

DOM.removeChildren = function(parent){
  const children = array.fromHtmlCol( parent.children );

  children.forEach(function(child){
    parent.removeChild(child);
  });
}

DOM.showAndHide = function({showElement, hideElement}){
    if(showElement !== undefined){
      showElement.classList.remove("hide");
      showElement.classList.add("show");
    }
    if(hideElement !== undefined){
      hideElement.classList.add("hide");
      hideElement.classList.remove("show");
    }
  }

  DOM.createElement = function(tag, attributes){
    const element = document.createElement(tag);
    for(let attributeName in attributes){
      const attributeValue = attributes[attributeName];
      element[attributeName] = attributeValue;
    }
    return element;
  }

  DOM.appendChildren = function(parent, children){
    for(let child of children){
      parent.appendChild(child);
    }
  }
  DOM.getElementByClassName = function(className, context = document){
    const HtmlCollection = context.getElementsByClassName(className);
    if(HtmlCollection.length){
      return HtmlCollection[0];
    }
    return undefined;
  }

/******************************************************************************/
//Helpers for array manipulation
const array = Object.create(null);

array.create = function(numberOfRaws, numberOfCol, value = null){
  const array = [];
  for(let i = 0; i < numberOfRaws; i++){
    array[i] = [];
    for(let j = 0; j < numberOfCol; j++){
      array[i][j] = value;
    }
  }
  return array;
}

array.fromObj = function(obj){
  const array = [];
  for(let prop in obj){
    array.push(obj[prop]);
  }
  return array;
}

array.fromHtmlCol = function(HtmlColl){
  const array = [];
  for(let prop in HtmlColl){
    const value = HtmlColl[prop];
    if( value.toString().includes("HTML") && value.toString().includes("Element") ){
      array.push(value);
    }
  }
  return array;
}

/******************************************************************************/

class Map {
    constructor(mapArray, mapName = "") {
      this.array = mapArray;
      this.rowsNumber = this.array.length;
      this.columnsNumber = this.array[0].length;
      this.mapName = mapName;
    }
}

Map.prototype.saveInLocal = function(){
  const savedMaps = JSON.parse( localStorage.getItem("savedMaps") ) || {};
  savedMaps[this.name] = this.array;
  localStorage.setItem("savedMaps", JSON.stringify(savedMaps) );
}

Map.prototype.save = function(newMap){
  this.array = newMap;
  this.saveInLocal();
}

Map.prototype.setValue = function(x, y, value){
  this.array[x][y] = value;
  this.saveInLocal();
}

Map.prototype.isEmpty = function(){
  for(let i = 0; i < this.rowsNumber; i++){
    for(let j = 0; j < this.columnsNumber; j++){
      if(this.array[i][j] !== "empty"){
        return false;
      }
    }
  }
  return true;
}

Map.prototype.isAlreadyInLocal = function(mapName){
  const name = mapName || this.name;
  
  const savedMaps = JSON.parse( localStorage.getItem("savedMaps") ) || {};
  return savedMaps[name] !== undefined;
}

Map.prototype.clear = function(){
  for(let i = 0; i < this.rowsNumber; i++){
    for(let j = 0; j < this.columnsNumber; j++){
      this.array[i][j] = "empty";
    }
  }
}

/******************************************************************************/
//Function to control FPS and stop resume callback function in requestAnimationFrame
function runAnimation(frameFunc,FPS) {

  let lastTime = null;

  function frame(time) {

    if (lastTime != null) {
      //If timeStep becomes greater then 1/FPS correct value
      let timeStep = Math.min((time - lastTime) / 1000, 1/FPS);
      //When difference between lastTime and currentTime becomes 1/FPS run callback
      if (timeStep >= 1/FPS) {
        lastTime = time;
        //Animation stops if callback return false
        if (frameFunc(timeStep) === false) return;
      }
    }
    lastTime = time;

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
/******************************************************************************/

function debounce(func, delay){
  let timeout = null;
  return function(){
    if(timeout === null){
      func.apply(null,arguments);
      timeout = setTimeout( () => timeout = null, delay); 
    }
  }
}

/******************************************************************************/

define(function () {
    return {
        Vector : Vector,
        DOM : DOM,
        array : array,
        Map : Map,
        runAnimation : runAnimation,
        debounce : debounce
    }
});