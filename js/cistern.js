var cistern = {
  cisternIndex: 0,
  totalPrice: 0,
  laborCost: 0,
  materialsCost: 0,
  laborHours: 0,
  allCisterns: [],
  tankModels: []
};

function cisternMaker (i, ci, a, m, h, g, inf, out) {
  this.index = i;
  this.cisternId = ci;
  this.roofArea = a;
  this.model = m;
  this.baseHeight = h;
  this.gutter = g;
  this.inflow = inf;
  this.outflow = out;
  this.paverbase = 0;
  this.stoneType = '';
  this.stones = 0;
  this.inflowHardware = 0;
  this.outflowHardware = 0;
  this.baseLaborHr = 0;
  this.inflowLaborHr = 0;
  this.outflowLaborHr = 0;
  this.baseLaborCost = 0;
  this.inflowLaborCost = 0;
  this.outflowLaborCost = 0;
  this.salePrice = 0;
  this.gutterCost = 0;
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

cistern.buildCistern = function(index) {
  var $id = $('#cistern').val();
  var $ra = +($('#roofArea').val());
  var $m = $('#cisternModel').val();
  var $bh = +($('#cisternBase').val());
  var $g = +($('#gutterFt').val());
  var $inf = +($('#cisternInflow').val());
  var $out = +($('#cisternOutflow').val());
  return new cisternMaker(index, $id, $ra, $m, $bh, $g, $inf, $out);
};

cistern.tankSalePrice = function (tank) {
  return Math.ceil(tank.purchasePrice * project.markup + tank.delivery);
};

cistern.calculateBaseMaterials = function (c) {
  let modelInfo = cistern.tankModels[c.model];
  c.salePrice = cistern.tankSalePrice(modelInfo);
  if (modelInfo.slimline) {
    c.paverbase = util.round('ceil', cistern.volumeRect(modelInfo.width, modelInfo.depth, c.baseHeight), 0.5);
    c.stoneType = 'cinder-block';
    c.stones = cistern.getCinderBlocks(modelInfo.width, c.baseHeight);
  } else {
    c.paverbase = util.round('ceil', cistern.volumeCyl(modelInfo.diameter, c.baseHeight), 0.5);
    c.stoneType = 'manor-stone';
    c.stones = cistern.getManorStones(modelInfo.diameter, c.baseHeight);
  }
  c.baseMaterialsCost = (c.paverbase * materials.gravel.paverbase) + (c.stones * materials.stone[c.stoneType]);
};

cistern.calculateLabor = function (c) {
  c.baseLaborHr = Math.ceil((c.paverbase + c.stones) / 3);
  c.inflowLaborHr = util.round('ceil', (c.inflow / 2), 0.5);
  c.outflowLaborHr = util.round('ceil', (c.outflow / 4), 0.5);
  c.baseLaborCost = util.laborCost(c.baseLaborHr);
  c.inflowLaborCost = util.laborCost(c.inflowLaborHr);
  c.outflowLaborCost = util.laborCost(c.outflowLaborHr);
};

cistern.calculatePlumbingMaterials = function(c) {
  c.gutterCost = util.materialCost(c.gutter, materials.plumbing.gutter);

  c.inflowHardware = cistern.calculateHardware(c.inflow);
  c.outflowHardware = cistern.calculateHardware(c.outflow);

  c.inflowMaterialsCost = util.round(
    'round',
    util.materialCost(c.inflow, materials.plumbing.pvc3In) + util.materialCost(c.inflowHardware, materials.plumbing.hardware),
    0.01);

  c.outflowMaterialsCost = util.round(
    'round',
    util.materialCost(c.outflow, materials.plumbing.pvc3In) + util.materialCost(c.outflowHardware, materials.plumbing.hardware) +
    materials.plumbing.lowFlowKit,
    0.01);
};

cistern.calculateHardware = function(pipe) {
  return pipe * 0.05;
};

cistern.calculateLaborTotal = function(c) {
  return c.baseLaborCost + c.inflowLaborCost + c.outflowLaborCost;
};

cistern.calculateMaterialsTotal = function(c) {
  return c.salePrice + c.gutterCost + c.baseMaterialsCost + c.inflowMaterialsCost + c.outflowMaterialsCost;
};

cistern.calcSubTotal = function(c) {
  return c.laborTotal + c.materialsTotal;
};

cistern.calculateTotals = function(c) {
  c.laborTotal = cistern.calculateLaborTotal(c);
  c.materialsTotal = cistern.calculateMaterialsTotal(c);
  c.subtotal = c.laborTotal + c.materialsTotal;
  c.tax = util.salesTax(c.subtotal);
  c.total = c.subtotal + c.tax;
};

cistern.volumeCyl = function(d, h) {
  return (Math.PI * Math.pow((d / 24), 2) * ((h / 2) + 0.33)) / 27;
};

cistern.volumeRect = function(w, d, h) {
  return w * d * h / 5832;
};

cistern.getManorStones = function (d, h) {
  return Math.ceil(Math.PI * d / 16) * h;
};

cistern.getCinderBlocks = function(l, h) {
  return Math.ceil(l / 16) * 3 * h;
};

var cisternView = {};

cisternView.handleNew = function() {
  $('#cistern-add').on('click', function(e) {
    e.preventDefault();
    let newCistern = cistern.buildCistern(cistern.cisternIndex);
    cistern.allCisterns.push(newCistern);
    cistern.calculateBaseMaterials(newCistern);
    cistern.calculateLabor(newCistern);
    cistern.calculatePlumbingMaterials(newCistern);
    cistern.calculateTotals(newCistern);
    cistern.cisternIndex += 1;
    viewUtil.clearForm();
  });
};

cisternView.init = function () {
  $('#cistern-content').show()
  .siblings().hide();
  cisternView.handleNew();
};
