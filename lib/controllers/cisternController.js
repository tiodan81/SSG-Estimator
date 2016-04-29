"use strict";

var cisternController = {};

cisternController.init = function () {
  cisternView.init();
};

cisternController.save = function () {
  var newCistern = cistern.buildCistern();
  cistern.allCalcs(newCistern);
  cistern.saveToProject(newCistern);
  cisternView.render(newCistern);
};