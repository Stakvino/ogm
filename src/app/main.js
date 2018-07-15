const tabSelectors   = document.querySelector("div.tab-selectors");
const editBlocks     = document.querySelector("div.edit-blocks");
const messageWarning = document.querySelector("div.warning-message");
const canvasBlock = document.querySelector("div.canvas-block");
const mapSprites = document.querySelector("div.map-sprites");
const addSprite  = document.querySelector(`button[name="add map sprite"]`);
const dimensionsInput = Array.from( document.querySelectorAll(`div.map-info input[type="text"]`) );

define(function (require) {
    const Canvas = require('canvas').Canvas;

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


    /*clicking on the create button on the map-info window will check if all dimensions are
    correctly typed and then create a new canvas with these dimensions*/
    for(let dimensionInput of dimensionsInput){
        dimensionInput.addEventListener("keydown",function(e){
            const input = e.key;
            if( !/[0-9]/.test(input) && e.key !== "Backspace" ){
                e.preventDefault();
            }
        });
    }

    //clicking on create new map button will load map-info window
    let mapCanvas = null;
    document.querySelector(`div.map-info button[name="create"]`).addEventListener("click",() => {
        //canvas dimension smaller then 20 or greater then 20000 or empty
        const canvasDimensions = Array.from( document.querySelectorAll(`div.map-info div`)[0].querySelectorAll("input") ).map(e => e.value);
        const canvasWrongDimension = canvasDimensions.filter(e => e < 20 || e > 20000 || e === "").length;
        //grid dimension smaller then 20 or greater then 2000 or empty
        const gridDimensions = Array.from( document.querySelectorAll(`div.map-info div`)[1].querySelectorAll("input") ).map(e => e.value);
        const gridWrongDimension = gridDimensions.filter(e => e < 10 || e > 2000 || e === "").length;

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

    //clicking on the cancel button on the map-info windo will just hide this window
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

    document.getElementById("load_map_sprite").addEventListener("input",function() {
        const files = this.files;
        for(let file of files){
            const path  = "img/background/" + file.name;
            const div   = DOM.createElement("div", {className : "sprite-block"});
            const img   = DOM.createElement("img", {src : path, width : 40, height : 40});
            const label = DOM.createElement("label", {className : "not-selectable-text"});
            label.textContent = file.name;

            img.addEventListener("load",function(){
                DOM.appendChildren(div, [img, label]);
                mapSprites.insertBefore(div, addSprite);
            }); 
        }
    });

});


