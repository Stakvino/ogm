const tabSelectors = {
  block    : document.querySelector("div.tab-selectors"),
  children : document.querySelectorAll("div.tab-selector")
}
const editBlocks = {
  block    : document.querySelector("div.edit-blocks"),
  children : document.querySelectorAll("div.edit-block")
}

tabSelectors.children.forEach(function(tabSelector){
  //attach event handler to every tab selectors
  tabSelector.addEventListener("click",function(){

    //Remove selected style from the current selected tab
    tabSelectors.block.querySelector("div.selected-tab").classList.remove("selected-tab");

    //hide the current selected block
    const currentEditBlock = editBlocks.block.querySelector(".show");
    currentEditBlock.classList.remove("show");
    currentEditBlock.classList.add("hide");

    //add selected style to the clicked tab
    this.classList.add("selected-tab");

    //get the selected edit block using the name of his tab
    const className = this.textContent + "-block";
    //show the selected edit block
    const selectedEditBlock = editBlocks.block.querySelector(`div.${className}`);
    selectedEditBlock.classList.remove("hide");
    selectedEditBlock.classList.add("show");

  });
});
