var cistern = {
  uberTank: {},
  allCisterns: [],
  tankModels: []
};

function cisternMaker (ci, ra, m, h, g, inf, out, al) {
  this.cisternId = ci || '';
  this.roofArea = ra || 0;
  this.model = m || '';
  this.baseHeight = h || 0;
  this.gutter = g || 0;
  this.inflow = inf || 0;
  this.outflow = out || 0;
  this.additionalLaborHr = al || 0;
  this.paverbase = 0;
  this.stoneType = '';
  this.manorStones = 0;
  this.cinderBlocks = 0;
  this.slimlineRestraints = 0;
  this.bulkheadKit = 0;
  // this.pump;
  // this.diverter;
  // this.gauge;
  this.inflowHardware = 0;
  this.outflowHardware = 0;
  this.baseLaborHr = 0;
  this.inflowLaborHr = 0;
  this.outflowLaborHr = 0;
  this.totalHr = 0;
  this.baseLaborCost = 0;
  this.inflowLaborCost = 0;
  this.outflowLaborCost = 0;
  this.additionalLaborCost = 0;
  this.salePrice = 0;
  this.gutterCost = 0;
  this.paverbaseCost = 0;
  this.manorStoneCost = 0;
  this.cinderBlockCost = 0;
  this.inflowPipeCost = 0;
  this.outflowPipeCost = 0;
  this.inflowHdwCost = 0;
  this.outflowHdwCost = 0;
  this.baseMaterialsCost = 0;
  this.inflowMaterialsCost = 0;
  this.outflowMaterialsCost = 0;
  this.laborTotal = 0;
  this.materialsTotal = 0;
  this.subtotal = 0;
  this.tax = 0;
  this.total = 0;
}

cistern.getJSON = function(callback) {
  $.getJSON('/data/cisternModels.json', function(data) {
    cistern.tankModels = data;
  });
  if (!Object.keys(materials).length) {
    $.getJSON('/data/materials.json', function(data) {
      materials = data;
    });
  }
  callback();
};

cistern.buildCistern = function() {
  var $id = $('#cistern').val();
  var $ra = +($('#roofArea').val());
  var $m = $('#cisternModel').val();
  var $bh = +($('#cisternBase').val());
  var $g = +($('#gutterFt').val());
  var $inf = +($('#cisternInflow').val());
  var $out = +($('#cisternOutflow').val());
  var $al = +($('#cisternAddLabor').val()) || 0;
  return new cisternMaker($id, $ra, $m, $bh, $g, $inf, $out, $al);
};

cistern.volumeCyl = function(d, h) {
  return (Math.PI * Math.pow((d / 24), 2) * ((h / 2) + 0.33)) / 27;
};

cistern.volumeRect = function(w, d, h) {
  return ((w * d / 144) * ((1/3) + ((2/3) * (3/5) * h))) / 27;
};

cistern.tankSalePrice = function (model, info) {
  if (model === 'b420' || model === 'b265' || model === 'b530') {
    return Math.ceil(info.purchasePrice + info.delivery);
  } else {
    return Math.ceil(info.purchasePrice * project.current.markup + info.delivery);
  }
};

cistern.calcManorStones = function (d, h) {
  return Math.ceil(Math.PI * d / 16) * h;
};

cistern.calcCinderBlocks = function(l, h) {
  return Math.ceil(l / 16) * 3 * h;
};

cistern.calculateHardware = function(pipe) {
  return Math.ceil(pipe * 0.05);
};

cistern.calcBaseLabor = function(c) {
  let labor;
  if (c.baseHeight === 0) {
    labor = 4 + Math.ceil((c.paverbase + c.manorStones + c.cinderBlocks) / 3);
  } else {
    labor = 10 + Math.ceil((c.paverbase + c.manorStones + c.cinderBlocks) / 3);
  }
  if (c.model === 'b420' || c.model === 'b265' || c.model === 'b530') {
    labor += 2;
  }
  return labor;
};

cistern.calculateBaseMaterials = function (c) {
  let modelInfo = cistern.tankModels[c.model];
  c.salePrice = cistern.tankSalePrice(c.model, modelInfo);
  if (modelInfo.slimline) {
    c.paverbase = util.round('ceil', cistern.volumeRect(modelInfo.width, modelInfo.depth, c.baseHeight), 0.5);
    c.stoneType = 'Cinder block';
    c.cinderBlocks = cistern.calcCinderBlocks(modelInfo.width, c.baseHeight);
    c.cinderBlockCost = util.round('round', (c.cinderBlocks * materials.stone[c.stoneType]), 0.01);
    c.slimlineRestraints = materials.plumbing.slimlineRestraints;
  } else {
    c.paverbase = util.round('ceil', cistern.volumeCyl(modelInfo.diameter, c.baseHeight), 0.5);
    c.stoneType = 'Manor stone';
    c.manorStones = cistern.calcManorStones(modelInfo.diameter, c.baseHeight);
    c.manorStoneCost = util.round('round', (c.manorStones * materials.stone[c.stoneType]), 0.01);
    c.slimlineRestraints = 0;
  }
  c.bulkheadKit = c.model.charAt(0) === 'p' ? materials.plumbing.bulkheadKit : 0;
  c.paverbaseCost = util.round('round', (c.paverbase * materials.gravel.paverbase), 0.01);
  c.baseMaterialsCost = util.round('round', c.paverbaseCost + c.cinderBlockCost + c.manorStoneCost + c.slimlineRestraints + c.bulkheadKit, 0.01);
};

cistern.calculateLabor = function (c) {
  c.baseLaborHr = cistern.calcBaseLabor(c);
  c.inflowLaborHr = util.round('ceil', (c.inflow / 2), 0.5);
  c.outflowLaborHr = util.round('ceil', (c.outflow / 4), 0.5);
  c.totalHr = c.baseLaborHr + c.inflowLaborHr + c.outflowLaborHr + c.additionalLaborHr;
  c.baseLaborCost = util.laborCost(c.baseLaborHr);
  c.inflowLaborCost = util.laborCost(c.inflowLaborHr);
  c.outflowLaborCost = util.laborCost(c.outflowLaborHr);
  c.additionalLaborCost = util.laborCost(c.additionalLaborHr);
};

cistern.calculatePlumbingMaterials = function(c) {
  c.gutterCost = util.materialCost(c.gutter, materials.plumbing.gutter);
  c.inflowPipeCost = util.round('round', util.materialCost(c.inflow, materials.plumbing.pvc3In), 0.01);
  c.outflowPipeCost = util.round('round', util.materialCost(c.outflow, materials.plumbing.pvc3In), 0.01);
  c.inflowHardware = cistern.calculateHardware(c.inflow);
  c.outflowHardware = cistern.calculateHardware(c.outflow);
  c.inflowHdwCost = util.round('round', util.materialCost(c.inflowHardware, materials.plumbing.hardware), 0.01);
  c.outflowHdwCost = util.round('round', util.materialCost(c.outflowHardware, materials.plumbing.hardware), 0.01);

  c.inflowMaterialsCost = util.round('round', c.inflowPipeCost + c.inflowHdwCost, 0.01);
  c.outflowMaterialsCost = util.round('round', c.outflowPipeCost + c.outflowHdwCost + materials.plumbing.lowFlowKit, 0.01);
};

cistern.calculateLaborTotal = function(c) {
  return c.baseLaborCost + c.inflowLaborCost + c.outflowLaborCost + c.additionalLaborCost;
};

cistern.calculateMaterialsTotal = function(c) {
  return c.salePrice + c.gutterCost + c.baseMaterialsCost + c.inflowMaterialsCost + c.outflowMaterialsCost;
};

cistern.calcSubTotal = function(c) {
  return util.round('round', c.laborTotal + c.materialsTotal, 0.01);
};

cistern.calculateTotals = function(c) {
  c.laborTotal = cistern.calculateLaborTotal(c);
  c.materialsTotal = cistern.calculateMaterialsTotal(c);
  c.subtotal = c.laborTotal + c.materialsTotal;
  c.tax = util.salesTax(c.subtotal);
  c.total = util.round('round', c.subtotal + c.tax, 0.01);
};

cistern.allCalcs = function(cur) {
  cistern.calculateBaseMaterials(cur);
  cistern.calculateLabor(cur);
  cistern.calculatePlumbingMaterials(cur);
  cistern.calculateTotals(cur);
};

cistern.makeUberTank = function(arr) {
  let obj = new cisternMaker();
  arr.forEach(function(e) {
    Object.keys(e).forEach(function(prop) {
      if (typeof(e[prop]) === 'number') {
        obj[prop] += e[prop];
      } else if (typeof(e[prop]) === 'string') {
        obj[prop] += e[prop] + ' ';
      }
    }, obj);
  });
  obj.cisternId = 'All tanks';
  return obj;
};

cistern.updateUberTank = function() {
  let uber = cistern.makeUberTank(cistern.allCisterns);
  cistern.uberTank = uber;
  if (cistern.allCisterns.length > 1) {
    cisternView.populateSelector(uber);
  }
};

cistern.saveToProject = function() {
  if(user.uid && project.current.client) {
    project.current.cisterns = {
      uberTank: cistern.uberTank,
      allCisterns: cistern.allCisterns
    };
    project.updateComponent(project.current, 'cisterns');
  } else {
    console.log('Either you\'re not signed in or haven\'t initiated a project!');
  }
};
