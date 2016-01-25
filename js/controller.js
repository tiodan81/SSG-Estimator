var controller = {};

controller.indexInit = function() {
  indexView.init();
};

controller.mulchInit = function() {
  mulchView.init();
};

controller.cisternInit = function() {
  cistern.getJSON(cisternView.init);
};
