'use strict';

var rgController = {};

rgController.init = function () {
  rgView.init();
};

rgController.save = function () {
  var $infKnown = $('#infiltKnown:checked').length ? true : false;

  if ($infKnown) {
    var newRG = rg.buildRG();
    var m = rg.getMultiplier(newRG);
    rg.allCalcs(newRG, m);
    rg.saveToProject(newRG);
    rgView.render(newRG);
  } else {
    var low = rg.buildRG();
    var mLow = rg.getMultiplier(low, 0.25);
    var high = rg.buildRG();
    var mHigh = rg.getMultiplier(high, 1);

    rg.allCalcs(low, mLow);
    low.id += ' - low estimate';
    rg.saveToProject(low);

    rg.allCalcs(high, mHigh);
    rg.saveToProject(high);

    rgView.render(low);
    rgView.render(high);
  }
};