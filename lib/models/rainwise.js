'use strict';

var rainwise = {};

rainwise.rwMaker = function (rw) {
  var _this = this;

  Object.keys(rw).forEach(function (e) {
    _this[e] = rw[e];
  }, this);
};

rainwise.build = function () {
  return new rainwise.rwMaker({
    gutterLength: +$('#gutterFt').val() || 0,
    inspection: $('#rw-inspection:checked').length ? true : false
  });
};

rainwise.calcs = function (rw) {
  rw.gutterCost = util.round('round', util.materialCost(rw.gutterLength, materials.plumbing.gutter), 0.01);
  rw.tax = util.salesTax(rw.gutterCost);
  rw.gutterTotal = util.round('round', rw.gutterCost + rw.tax, 0.01);
  rw.inspectionCost = rw.inspection ? materials.fees.rainwiseInspection : 0;
  rw.subtotal = util.round('round', rw.gutterCost + rw.inspectionCost, 0.01);
  rw.total = util.round('round', rw.subtotal + rw.tax, 0.01);
};

rainwise.saveToProject = function (rw) {
  if (user.uid && project.current.client) {
    project.current.rainwise.uber = rw;
    project.updateComponent(project.current, 'rainwise');
  } else {
    return new Error('Either you\'re not signed in or haven\'t initiated a project!');
  }
};