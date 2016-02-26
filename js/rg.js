var rg = {
  uberRG: {},
  allRGs: [],
  current: {}
};

rg.rgMaker = function(rg) {
  Object.keys(rg).forEach(function(e) {
    this[e] = rg[e];
  }, this);
};

rg.buildRG = function() {
  return new rg.rgMaker({
    id: $('#rgID').val(),
    roof: +($('#roofArea').val()),
    infKnown: $('#infiltKnown:checked').length ? true : false,
    infRate: +($('#rgInfiltRate').val()),
    plant: +($('#rgPlantBudget').val()),
    infType: $('input[name=rgInflow]:checked').val(),
    infVeg: $('#rgVegInflow:checked').length ? true : false,
    infLen: ($('#rgInfLength').val()),
    outType: $('input[name=rgOutflow]:checked').val(),
    outVeg: $('#rgVegOutflow:checked').length ? true : false,
    outLen: ($('#rgOutLength').val()),
    fedByCistern: $('#fedByCistern:checked').length ? true : false,
    sodCutter: $('#rgSodCutter:checked').length ? true : false,
    dumpTruck: $('#rgDumpTruck:checked').length ? true : false
  });
};
