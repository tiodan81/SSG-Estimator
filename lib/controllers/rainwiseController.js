'use strict';

var rainwiseController = {};

rainwiseController.init = function () {
  rainwiseView.init();
};

rainwiseController.save = function () {
  var newRW = rainwise.build();
  rainwise.calcs(newRW);
  rainwise.saveToProject(newRW);
  rainwiseView.render(newRW);
  rainwiseView.clearForm();
  $('#rainwise-edit-buttons').show();
};