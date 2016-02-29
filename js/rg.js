var rg = {
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
    plantCost: +($('#rgPlantBudget').val()),
    infType: $('input[name=rgInflow]:checked').val(),
    infVeg: $('#rgVegInflow:checked').length ? true : false,
    infLen: +($('#rgInfLength').val()),
    outType: $('input[name=rgOutflow]:checked').val(),
    outVeg: $('#rgVegOutflow:checked').length ? true : false,
    outLen: +($('#rgOutLength').val()),
    fedByCistern: $('#fedByCistern:checked').length ? true : false,
    sodRmMethod: $('input[name=rgSod]:checked').val(),
    dumpTruck: $('#rgDumpTruck:checked').length ? true : false
  });
};

rg.decider = function(c) {
  if (c.infKnown) {
    let m = rg.getMultiplier(c);
    rg.allCalcs(c, m);
    //calcs
  } else {
    let high = rg.getMultiplier(c, 1);
    let low = rg.getMultiplier(c, 0.25);
    //allCalcs high & low. or something
  }
};

rg.getMultiplier = function(c, rate = c.infRate) {
  const nums = [
    [0.033, 0.074],
    [0.017, 0.046],
    [0.007, 0.028]
  ];
  let a;
  let b = c.fedByCistern ? 0 : 1;

  if (rate < 0.25) {
    alert('Too low! No rain garden for you.');
    return;
  } else if (rate < 0.5) {
    a = 0;
  } else if (rate < 1) {
    a = 1;
  } else {
    a = 2;
  }

  return nums[a][b];
};

rg.allCalcs = function(cur, mult) {
  rg.getArea(cur, mult);
  rg.baseMaterials(cur);
  rg.baseMaterialCost(cur);
};

rg.getArea = function(c, m) {
  c.baseArea = Math.ceil(c.roof * m);
  c.footprint = Math.ceil((4 * c.baseArea + 2) * 0.8);
};

rg.baseMaterials = function (c) {
  c.sodVolume = util.round('ceil', c.footprint / 6 / 27, 0.5);
  c.bioretVolume = util.round('ceil', c.baseArea / 27, 0.5);
  c.mulchVolume = util.round('ceil', c.footprint / 4 / 27, 0.5);
};

rg.baseMaterialCost = function(c) {
  c.sodDumpCost = rg.calcSodDumpCost(c);
  c.bioretCost = util.round('round', c.bioretVolume * materials.bulk.bioretention, 0.01);
  c.mulchCost = util.round('round', c.mulchVolume * materials.bulk.mulch, 0.01);
  c.cutterCost = rg.sodRmMethod === 'cutter' ? materials.fees.sodCutter : 0;
  c.truckCost = rg.dumpTruck ? materials.fees.dumpTruck : 0;
  c.baseMaterialsTotal = rg.baseMaterialsTotal(c);
};

rg.baseMaterialsTotal = function(c) {
  return util.round('round', c.sodDumpCost + c.bioretCost + c.mulchCost + c.cutterCost + c.truckCost + c.plantCost, 0.01);
};

rg.calcSodDumpCost = function(c) {
  if (c.sodRmMethod === 'manual' || c.sodRmMethod === 'cutter') {
    return util.round('round', c.sodVolume * materials.fees.sodDump, 0.01);
  } else {
    return 0;
  }
};



// inflow/outflow
//   'dispersion kit' (3ft channel)
//     if (roofArea < 1000) {
//       1
//     } else {
//       2
//     }
//
//   if (pipe) {
//     pipe length
//     pipe cost
//   } else {
//     channel length
//     pond liner
//       sq ft
//       cost
//     bioretention
//       vol
//       cost
//     plants
//     drain rock
//       vol
//       cost
//   }
//
// labor
//   sod
//     if (sodCutter) {
//       util.round('ceil', footprint / 171, 0.25)
//     } else {
//       util.round('ceil', footprint / 60, 0.25)
//     }
//   excavation
//     util.round('ceil', (baseArea / 2) + 3, 0.25)
//   bioretention, mulch
//     2 * vol + 1
//   planting
//     util.round('ceil', (footprint / 20) + 4, 0.25)
//   inflow/outflow
//     if (pipe) {
//       length / 4
//     } else {
//       excav/liner = length / 4
//       soil = vol + 1
//       planting = length / 4
//       drain rock = vol + 1
//     }
