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

define(function () {
    return {
        Vector : Vector,
        DOM : DOM,
        runAnimation : runAnimation
    }
});