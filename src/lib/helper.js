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

array.create = function(numberOfRaws, numberOfCol = 0, value = null){
  const array = [];
  for(let i = 0; i < numberOfRaws; i++){
    if(numberOfCol === 0){
      array.push(value);
      continue;
    }
    array[i] = [];
    for(let j = 0; j < numberOfCol; j++){
      array[i][j] = value;
    }
  }
  return array;
}

array.createCopy = function(copiedArray){
  const copy = [];
  for(let i = 0; i < copiedArray.length;i++){
    if(typeof copiedArray[i] === "object"){
     if( Array.isArray(copiedArray[i]) ){
      copy.push( array.createCopy(copiedArray[i]) );
     }else{
      //change to deep copy
      copy.push( Object.assign(copiedArray[i]) ); 
     }
    }
    else{
      copy.push(copiedArray[i]);
    }
  }
  return copy;
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

array.haveDifferentValues = function(array1, array2){

  if(array1.length !== array2.length){
    return true;
  }
  let result = false;
  //dont handle objects
  for(let i = 0; i < array1.length; i++){
    if( Array.isArray(array1[i]) && Array.isArray(array2[i]) ){
      result = result || array.haveDifferentValues(array1[i], array2[i]);
    }
    else if(array1[i] === array2[i]){
      continue;    
    }
    else{
      return true;
    }
  }
  return result;
}

/******************************************************************************/

class Map {
    constructor(mapArray, mapSize, gridSize, mapName = "") {
      this.array = mapArray;
      this.gridSize = gridSize;
      this.size = mapSize;
      this.name = mapName;
      
      this.rowsNumber = this.array.length;
      this.columnsNumber = this.array[0].length;
      this.isSaved = true;
    }
    
    get elemetsTypes() {
      const typesArray = [];
      for(let i = 0; i < this.rowsNumber; i++){
        for(let j = 0; j < this.columnsNumber; j++){
          if( !typesArray.includes(this.array[i][j]) && this.array[i][j] !== "empty"){
            typesArray.push(this.array[i][j])
          }
        }
      }
      return typesArray;
    }
}

Map.prototype.createCopy = function(){
  const mapArray = array.createCopy( this.array );
  let mapSize = this.size;
  if(mapSize){
  mapSize = new Vector(this.size.x, this.size.y);   
  }
  let gridSize = this.gridSize;
  if(gridSize){
  gridSize = new Vector(this.gridSize.x, this.gridSize.y);   
  }
  
  return new Map(mapArray, mapSize, gridSize, this.name);
}

Map.prototype.saveInLocal = function(){
  const savedMaps = JSON.parse( localStorage.getItem("savedMaps") ) || {};
  savedMaps[this.name] = { mapArray : this.array, mapSize : this.size, gridSize : this.gridSize };
  localStorage.setItem("savedMaps", JSON.stringify(savedMaps) );
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

//Finds the coordinates in map array in which there is no data after them (only empty)
Map.prototype.limits = function(){
  const xLimits = array.create(this.array.length, 0, 0);
  const yLimits = array.create(this.array[0].length, 0, 0);
  for(let i = 0; i < this.array.length; i++){
    for(let j = 0; j < this.array[0].length; j++){
      if(this.array[i][j] !== "empty"){
        xLimits[i] = j;
        yLimits[j] = i; 
      }
    }
  }
  return {x : Math.max(...xLimits) + 1, y : Math.max(...yLimits) + 1};
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