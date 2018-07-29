
define(function (require) {
  const Canvas = require('canvas').Canvas;
  const DOM = require('helper').DOM;
  const array = require('helper').array;
  require('app/map');
  
  //remove default dotted outline when button is focused with js to avoid firefox bug
  const buttons = array.fromHtmlCol( document.getElementsByTagName("button") );
  buttons.forEach( (button) => {
    button.addEventListener("mousedown",function(){
      this.style.outline = "none";
    });
  });
  
  const tabsContainer = DOM.getElementByClassName("tab-selectors");
  const tabs = array.fromHtmlCol( tabsContainer.children );
  const editBlocksContainer = DOM.getElementByClassName("edit-blocks");
  const editBlocks = array.fromHtmlCol( editBlocksContainer.children );
  
  //switching tabs event handler 
  tabs.forEach(function(tabSelector){
      tabSelector.addEventListener("click",function(){
        //Remove selected style from the current selected tab
        const currentTab = DOM.getElementByClassName("selected-tab", tabsContainer);
        currentTab.classList.remove("selected-tab");

        //hide the current selected block
        const currentEditBlock = array.fromHtmlCol( editBlocksContainer.children ).filter( e => e.classList.contains("show") )[0];
        DOM.showAndHide({hideElement : currentEditBlock});

        //add selected style to the clicked tab
        this.classList.add("selected-tab");

        //get the selected edit block
        const indexOfTab = tabs.indexOf(this);
        const selectedEditBlock = editBlocks[indexOfTab];
        //show the selected edit block
        DOM.showAndHide({showElement : selectedEditBlock});
      });
  });
  
  //window.onbeforeunload = () => "";
  
});


