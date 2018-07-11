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
}

function angleBetween(point1, point2){
  const dy = point2.y - point1.y;
  const dx = point2.x - point1.x;

  return Math.atan2(dy,dx);
}

function vectorCord(magnitude, angle){
  return new Vector(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
}

function vectorMagnitude(vector){
  return Math.sqrt( Math.pow(vector.x, 2) +  Math.pow(vector.y, 2) );
}

/******************************************************************************/
//Helpers for DOM manipulation
const DOM = Object.create(null);

DOM.createImg = function(src){
  const img = document.createElement("img");
  img.src = src;
  return img;
}

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
