'use strict';

var rg = {
  current: {}
};

rg.rgMaker = function (rg) {
  Object.keys(rg).forEach(function (e) {
    this[e] = rg[e];
  }, this);
};

rg.buildRG = function () {
  var inNum = +$('#rg-inflow-num').val();
  var outNum = +$('#rg-outflow-num').val();

  return new rg.rgMaker({
    id: $('#rgID').val(),
    roof: +$('#rg-roofArea').val(),
    infKnown: $('#infiltKnown:checked').length ? true : false,
    infRate: +$('#rgInfiltRate').val(),
    plantCost: +$('#rgPlantBudget').val(),
    infNum: inNum,
    infType1: $('input[name=rgInflow1]:checked').val(),
    infVeg1: $('#rgVegInflow1:checked').length ? true : false,
    infLen1: +$('#rgInfLength1').val(),
    infType2: inNum == 2 ? $('input[name=rgInflow2]:checked').val() : null,
    infVeg2: inNum == 2 ? $('#rgVegInflow2:checked').length ? true : false : null,
    infLen2: inNum == 2 ? +$('#rgInfLength2').val() : null,
    outNum: outNum,
    outType1: $('input[name=rgOutflow1]:checked').val(),
    outVeg1: $('#rgVegOutflow1:checked').length ? true : false,
    outLen1: +$('#rgOutLength1').val(),
    outType2: outNum == 2 ? $('input[name=rgOutflow2]:checked').val() : null,
    outVeg2: outNum == 2 ? $('#rgVegOutflow2:checked').length ? true : false : null,
    outLen2: outNum == 2 ? +$('#rgOutLength2').val() : null,
    fedByCistern: $('#fedByCistern:checked').length ? true : false,
    sodRmMethod: $('input[name=rgSod]:checked').val(),
    dumpTruck: $('#rgDumpTruck:checked').length ? true : false
  });
};

rg.getMultiplier = function (c) {
  var rate = arguments.length <= 1 || arguments[1] === undefined ? c.infRate : arguments[1];

  var nums = [[0.033, 0.074], [0.017, 0.046], [0.007, 0.028]];
  var a = void 0;
  var b = c.fedByCistern ? 0 : 1;

  if (rate < 0.25) {
    alert('The infiltration rate is too low! No rain garden for you.');
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

rg.allCalcs = function (cur, mult) {
  cur.area = rg.getArea(cur, mult);
  cur.baseMaterials = rg.baseMaterials(cur);
  cur.baseMaterialCost = rg.baseMaterialCost(cur);
  cur.truckCost = cur.dumpTruck ? materials.fees.dumpTruck : 0;
  cur.cutterCost = cur.sodRmMethod === 'cutter' ? materials.fees.sodCutter : 0;
  cur.plumbingMaterials = rg.plumbingMaterials(cur);
  cur.plumbingMaterialCost = rg.plumbingMaterialCost(cur);
  rg.laborHrs(cur);
  rg.laborCost(cur);
  cur.totals = rg.totals(cur);
  cur.materialSummary = rg.materialSummary(cur);
};

rg.getArea = function (c, m) {
  var area = Math.ceil(c.roof * m);

  return {
    baseArea: area,
    footprint: Math.ceil((4 * area + 2) * 0.8)
  };
};

rg.baseMaterials = function (c) {
  var a = c.area;
  return {
    sodVolume: util.round('ceil', a.footprint / 6 / 27, 0.5),
    bioretention: util.round('ceil', a.baseArea / 27, 0.5),
    mulchVolume: util.round('ceil', a.footprint / 4 / 27, 0.5)
  };
};

rg.baseMaterialCost = function (c) {
  var m = c.baseMaterials;
  var bmc = {
    sodDumpCost: rg.calcSodDumpCost(c, m),
    bioretentionCost: util.round('round', m.bioretention * materials.bulk.bioretention, 0.01),
    mulchCost: util.round('round', m.mulchVolume * materials.bulk.mulch, 0.01)
  };
  bmc.total = util.sumObject(bmc);
  return bmc;
};

rg.calcSodDumpCost = function (c, m) {
  if (c.sodRmMethod === 'manual' || c.sodRmMethod === 'cutter') {
    return util.round('round', m.sodVolume * materials.fees.sodDump, 0.01);
  } else {
    return 0;
  }
};

rg.plumbingMaterials = function (c) {
  return {
    dispersionChannelMaterials: c.roof < 1000 ? rg.channelMaterials(3) : rg.channelMaterials(6),
    inflow1Materials: c.infType1 === 'channel' ? rg.channelMaterials(c.infLen1) : rg.pipeMaterials(c.infLen1, 'in'),
    inflow2Materials: c.infNum === 2 ? c.infType2 === 'channel' ? rg.channelMaterials(c.infLen2) : rg.pipeMaterials(c.infLen2, 'in') : null,
    outflow1Materials: c.outType1 === 'channel' ? rg.channelMaterials(c.outLen1) : rg.pipeMaterials(c.outLen1, 'out'),
    outflow2Materials: c.outNum === 2 ? c.outType2 === 'channel' ? rg.channelMaterials(c.outLen2) : rg.pipeMaterials(c.outLen2, 'out') : null
  };
};

rg.channelMaterials = function (len) {
  var area = Math.round(len * 2);

  return {
    pondliner: area,
    bioretention: len > 3 ? util.round('ceil', area / 3 / 27, 0.5) : 0.1,
    drainageRock: len > 3 ? util.round('ceil', area / 3 / 27, 0.5) : 0.1
  };
};

rg.pipeMaterials = function (len, inout) {
  var type = inout === 'in' ? 'pvc3In' : 'pvc4In';
  var obj = {};
  obj[type] = len;
  return obj;
};

rg.plumbingMaterialCost = function (c) {
  var m = c.plumbingMaterials;
  var pmc = {
    dispersionMaterialCost: rg.channelMaterialCost(m.dispersionChannelMaterials),
    inflow1MaterialCost: c.infType1 === 'channel' ? rg.channelMaterialCost(m.inflow1Materials, c.infVeg1) : rg.pipeMaterialCost(m.inflow1Materials),
    inflow2MaterialCost: c.infNum === 2 ? c.infType2 === 'channel' ? rg.channelMaterialCost(m.inflow2Materials, c.infVeg2) : rg.pipeMaterialCost(m.inflow2Materials) : { total: 0 },
    outflow1MaterialCost: c.outType1 === 'channel' ? rg.channelMaterialCost(m.outflow1Materials, c.outVeg1) : rg.pipeMaterialCost(m.outflow1Materials),
    outflow2MaterialCost: c.outNum === 2 ? c.outType2 === 'channel' ? rg.channelMaterialCost(m.outflow2Materials, c.outVeg2) : rg.pipeMaterialCost(m.outflow2Materials) : { total: 0 }
  };
  pmc.total = util.round('round', pmc.dispersionMaterialCost.total + pmc.inflow1MaterialCost.total + pmc.inflow2MaterialCost.total + pmc.outflow1MaterialCost.total + pmc.outflow2MaterialCost.total, 0.01);
  return pmc;
};

rg.channelMaterialCost = function (m, veg) {
  var cmc = {
    pondlinerCost: util.round('round', util.materialCost(m.pondliner, materials.fabric.pondliner), 0.01),
    bioretentionCost: util.round('round', util.materialCost(m.bioretention, materials.bulk.bioretention), 0.01),
    drainageRockCost: util.round('round', util.materialCost(m.drainageRock, materials.bulk.drainageRock), 0.01),
    plantCost: veg ? util.round('round', util.materialCost(m.pondliner, materials.misc.rgChannelPlanting), 0.01) : 0
  };
  cmc.total = util.sumObject(cmc);
  return cmc;
};

rg.pipeMaterialCost = function (m) {
  var key = void 0,
      type = void 0,
      cost = void 0;
  if (m.hasOwnProperty('pvc3In')) {
    key = 'pvc3InCost';
    type = materials.plumbing.pvc3In;
    cost = util.round('round', util.materialCost(type, m.pvc3In), 0.01);
  } else {
    key = 'pvc4InCost';
    type = materials.plumbing.pvc4In;
    cost = util.round('round', util.materialCost(type, m.pvc4In), 0.01);
  }
  var obj = { total: cost };
  obj[key] = cost;
  return obj;
};

rg.laborHrs = function (c) {
  var m = c.plumbingMaterials;

  c.baseHrs = rg.baseHrs(c);
  c.dispersionHrs = rg.channelHrs(m.dispersionChannelMaterials, 3, false);
  c.inflow1Hrs = c.infType1 === 'channel' ? rg.channelHrs(m.inflow1Materials, c.infLen1, c.infVeg1) : rg.pipeHrs(c.infLen1);
  c.inflow2Hrs = c.infNum === 2 ? c.infType2 === 'channel' ? rg.channelHrs(m.inflow2Materials, c.infLen2, c.infVeg2) : rg.pipeHrs(c.infLen2) : 0;
  c.outflow1Hrs = c.outType1 === 'channel' ? rg.channelHrs(m.outflow1Materials, c.outLen1, c.outVeg1) : rg.pipeHrs(c.outLen1);
  c.outflow2Hrs = c.outNum === 2 ? c.outType2 === 'channel' ? rg.channelHrs(m.outflow2Materials, c.outLen2, c.outVeg2) : rg.pipeHrs(c.outLen2) : 0;
};

rg.baseHrs = function (c) {
  var sodHrs = rg.sodHrs(c.sodRmMethod, c.area.footprint);
  var excavationHrs = util.round('ceil', c.area.baseArea / 2 + 3, 0.5);
  var bioretenHrs = Math.round(2 * c.baseMaterials.bioretention + 1);
  var mulchHrs = Math.round(2 * c.baseMaterials.mulchVolume + 1);
  var plantingHrs = util.round('ceil', c.area.footprint / 20 + 4, 0.5);

  return {
    sodHrs: sodHrs,
    excavationHrs: excavationHrs,
    bioretenHrs: bioretenHrs,
    mulchHrs: mulchHrs,
    plantingHrs: plantingHrs,
    total: util.round('ceil', sodHrs + excavationHrs + bioretenHrs + mulchHrs + plantingHrs, 0.25)
  };
};

rg.sodHrs = function (method, footprint) {
  if (method === 'cutter') {
    return util.round('ceil', footprint / 171, 0.5);
  } else if (method === 'manual') {
    return util.round('ceil', footprint / 60, 0.5);
  } else {
    return 0;
  }
};

rg.channelHrs = function (mat, len, veg) {
  var excavationHrs = len / 4;
  var bioretenHrs = mat.bioretention + 1;
  var plantingHrs = veg ? len / 4 : 0;
  var rockHrs = mat.drainageRock + 1;

  return util.round('ceil', excavationHrs + bioretenHrs + plantingHrs + rockHrs, 0.5);
};

rg.pipeHrs = function (len) {
  return util.round('ceil', len / 4, 0.5);
};

rg.laborCost = function (c) {
  var inf2 = c.infNum === 2 ? c.inflow2Hrs : 0;
  var out2 = c.outNum === 2 ? c.outflow2Hrs : 0;

  c.baseLaborCost = rg.baseLaborCost(c.baseHrs);
  c.dispersionLaborCost = util.laborCost(c.dispersionHrs);
  c.inflow1LaborCost = util.laborCost(c.inflow1Hrs);
  c.inflow2LaborCost = inf2 != 0 ? util.laborCost(inf2) : 0;
  c.outflow1LaborCost = util.laborCost(c.outflow1Hrs);
  c.outflow2LaborCost = out2 != 0 ? util.laborCost(out2) : 0;
};

rg.baseLaborCost = function (base) {
  var blc = {
    sodLaborCost: util.laborCost(base.sodHrs),
    excavationLaborCost: util.laborCost(base.excavationHrs),
    bioretentionLaborCost: util.laborCost(base.bioretenHrs),
    mulchLaborCost: util.laborCost(base.mulchHrs),
    plantingLaborCost: util.laborCost(base.plantingHrs)
  };
  blc.total = util.sumObject(blc);
  return blc;
};

rg.totals = function (c) {
  var lc = c.laborCost;
  var lh = c.laborHrs;

  var materialsCost = util.round('round', c.baseMaterialCost.total + c.plumbingMaterialCost.total + c.plantCost + c.truckCost + c.cutterCost, 0.01);
  var laborCost = util.round('round', c.baseLaborCost.total + c.dispersionLaborCost + c.inflow1LaborCost + c.inflow2LaborCost + c.outflow1LaborCost + c.outflow2LaborCost, 0.01);
  var laborHrs = util.round('ceil', c.baseHrs.total + c.dispersionHrs + c.inflow1Hrs + c.inflow2Hrs + c.outflow1Hrs + c.outflow2Hrs, 0.5);
  var subtotal = util.round('round', materialsCost + laborCost, 0.01);
  var tax = util.round('round', util.salesTax(subtotal), 0.01);
  var total = util.round('round', subtotal + tax, 0.01);

  return {
    materialsCostTotal: materialsCost,
    laborCostTotal: laborCost,
    laborHrsTotal: laborHrs,
    subtotal: subtotal,
    tax: tax,
    total: total
  };
};

rg.materialSummary = function (c) {
  return {
    bio: util.round('round', util.plucky('bioretention', c), 0.25),
    rock: util.round('round', util.plucky('drainageRock', c), 0.25),
    pond: util.round('round', util.plucky('pondliner', c), 1),
    bioCost: util.round('round', util.plucky('bioretentionCost', c), 0.01),
    rockCost: util.round('round', util.plucky('drainageRockCost', c), 0.01),
    pondCost: util.round('round', util.plucky('pondlinerCost', c), 0.01),
    sodDumpCost: c.baseMaterialCost.sodDumpCost,
    cutterCost: c.cutterCost,
    truckCost: c.truckCost,
    pvc3In: util.round('round', util.plucky('pvc3In', c), 1),
    pvc4In: util.round('round', util.plucky('pvc4In', c), 1),
    pvc3InCost: util.round('round', util.plucky('pvc3InCost', c), 0.01),
    pvc4InCost: util.round('round', util.plucky('pvc4InCost', c), 0.01),
    plantCost: util.round('round', util.plucky('plantCost', c), 0.01)
  };
};

rg.preventDuplicates = function () {
  var $id = $('#rgID').val();
  var $exists = util.findObjInArray($id, project.current.rainGardens.all, 'id').length;
  if ($exists) {
    return true;
  } else {
    return false;
  }
};

rg.saveToProject = function (newRG) {
  if (user.uid && project.current.client) {
    rg.storeLocally(newRG);
    project.updateComponent(project.current, 'rainGardens');
  } else {
    alert('Either you\'re not signed in or haven\'t initiated a project!');
  }
};

rg.storeLocally = function (newRG) {
  var cur = project.current.rainGardens.all;
  var $exists = util.findObjInArray(newRG.id, cur, 'id');
  if ($exists.length) {
    cur.forEach(function (c, i) {
      if (newRG.id === c.id) {
        cur[i] = newRG;
      }
    });
  } else {
    cur.push(newRG);
  }
  rg.updateUberRG(newRG);
  rg.current = newRG;
};

rg.updateUberRG = function () {
  var rgs = project.current.rainGardens;
  var uber = rg.makeUberRG(rg.excludeLowEst(rgs.all));
  rgs.uber = uber;
  if (rgs.all.length > 1) {
    rgView.populateSelector(uber);
  }
};

rg.excludeLowEst = function (arr) {
  var re = /(low estimate)/;
  return arr.filter(function (e) {
    return re.test(e.id) == false;
  });
};

rg.makeUberRG = function (all) {

  var picked = util.objectStripper(all, ['totals', 'materialSummary', 'baseHrs', 'dispersionHrs', 'inflow1Hrs', 'inflow2Hrs', 'outflow1Hrs', 'outflow2Hrs', 'baseLaborCost', 'dispersionLaborCost', 'inflow1LaborCost', 'inflow2LaborCost', 'outflow1LaborCost', 'outflow2LaborCost', 'baseMaterials', 'baseMaterialCost']);
  var uber = rg.merger(picked);
  uber.id = 'All rain gardens';
  uber.dumpTruck = util.picker(all, 'dumpTruck').indexOf(true) >= 0 ? true : false;
  uber.sodRmMethod = rg.getUberSodRmMethod(all);
  if (uber.dumpTruck) {
    uber.truckCost = materials.fees.dumpTruck;
  }
  if (uber.sodRmMethod === 'cutter') {
    uber.cutterCost = materials.fees.sodCutter;
  }
  if (uber.inflow2Hrs > 0) {
    uber.infNum = 2;
  }
  if (uber.outflow2Hrs > 0) {
    uber.outNum = 2;
  }
  return uber;
};

rg.getUberSodRmMethod = function (arr) {
  var method = util.picker(arr, 'sodRmMethod');

  if (method.indexOf('cutter') >= 0) {
    return 'cutter';
  } else if (method.indexOf('manual') >= 0) {
    return 'manual';
  } else {
    return 'none';
  }
};

rg.merger = function (arr) {
  var merged = $.extend(true, {}, arr[0]);

  for (var i = 1; i < arr.length; i++) {
    for (var prop in arr[i]) {
      if (typeof merged[prop] === 'number') {
        merged[prop] += arr[i][prop];
      } else if (Object.prototype.toString.call(merged[prop]) === '[object Object]') {
        for (var nestprop in merged[prop]) {
          if (typeof merged[prop][nestprop] === 'number') {
            merged[prop][nestprop] += arr[i][prop][nestprop];
          }
        }
      }
    }
  }
  return merged;
};