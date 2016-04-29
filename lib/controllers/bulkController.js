'use strict';

var bulkController = {};

bulkController.init = function () {
  bulkView.init();
};

bulkController.save = function () {
  var newBulk = bulk.build();
  bulk.calcs(newBulk);
  bulk.saveToProject(newBulk);
  bulkView.renderDetails(newBulk.type);
  $('#bulk-nav > button:last-child').addClass('button-primary').siblings().removeClass('button-primary');
  bulkView.handleNav();
  bulkView.populateSelector(newBulk);
  $('#bulk-selector').val(newBulk.type);
};

bulkController.delete = function (curId, curType) {
  var all = project.current.bulkMaterials.all;

  all.forEach(function (bm, i) {
    if (bm.id === curId) {
      all.splice(i, 1);
    }
  });

  if (all.length) {

    if (util.picker(all, 'type').indexOf(curType) === -1) {
      var firstRemainingType = all[0].type;
      $('#bulk-selector > option[value="' + curType + '"]').remove();
      $('#bulk-selector').val(firstRemainingType);
      bulkView.renderDetails(firstRemainingType);
    } else {
      bulkView.renderDetails(curType);
    }
  } else {
    project.current.bulkMaterials = { all: [], uber: {} };
    $('#bulk-display').hide();
  }

  project.current.bulkMaterials.uber = bulk.makeUber(all);
  project.updateComponent(project.current, 'bulkMaterials');
};