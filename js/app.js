const tabSelectors = document.querySelector("div.tab-selectors");
const editBlocks   = document.querySelector("div.edit-blocks");

//switching tabs event handler
tabSelectors.querySelectorAll("div.tab-selector").forEach(function(tabSelector){

  tabSelector.addEventListener("click",function(){
    //Remove selected style from the current selected tab
    tabSelectors.querySelector("div.selected-tab").classList.remove("selected-tab");

    //hide the current selected block
    const currentEditBlock = editBlocks.querySelector(".show");
    currentEditBlock.classList.remove("show");
    currentEditBlock.classList.add("hide");

    //add selected style to the clicked tab
    this.classList.add("selected-tab");

    //get the selected edit block using the name of his tab
    const className = this.textContent + "-block";
    //show the selected edit block
    const selectedEditBlock = editBlocks.querySelector(`div.${className}`);
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
    document.querySelector("div.map-edit").classList.remove("hide");
    document.querySelector("div.map-list").classList.add("hide");
});

//clicking on the map list button will get you back to the map list block
document.querySelector(`button[name="map list"]`).addEventListener("click",() => {
    document.querySelector("div.map-list").classList.remove("hide");
    document.querySelector("div.map-edit").classList.add("hide");
});