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
  const children = Array.from(parent.children);

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

  DOM.createElement = function(tag, properties){
    const element = document.createElement(tag);
    for(let proprety in properties){
      element[proprety] = properties[proprety];
    }
    return element;
  }

  DOM.appendChildren = function(parent, children){
    for(let child of children){
      parent.appendChild(child);
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

function objToArray(obj){
  const array = [];
  for(let prop in obj){
    array.push(obj[prop]);
  }
  return array;
}

/******************************************************************************/

define(function () {
    return {
        Vector : Vector,
        DOM : DOM,
        runAnimation : runAnimation
    }
});