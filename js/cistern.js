var cistern = {
  laborHoursTotal: 0,
  laborCostTotal: 0,
  materialsCostTotal: 0,
  taxTotal: 0,
  grandTotal: 0,
  allCisterns: [],
  tankModels: []
};

function cisternMaker (ci, a, m, h, g, inf, out) {
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
  this.totalHr = 0;
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

cistern.buildCistern = function() {
  var $id = $('#cistern').val();
  var $ra = +($('#roofArea').val());
  var $m = $('#cisternModel').val();
  var $bh = +($('#cisternBase').val());
  var $g = +($('#gutterFt').val());
  var $inf = +($('#cisternInflow').val());
  var $out = +($('#cisternOutflow').val());
  return new cisternMaker($id, $ra, $m, $bh, $g, $inf, $out);
};

cistern.volumeCyl = function(d, h) {
  return (Math.PI * Math.pow((d / 24), 2) * ((h / 2) + 0.33)) / 27;
};

cistern.volumeRect = function(w, d, h) {
  return w * d * h / 5832;
};

cistern.tankSalePrice = function (tank) {
  return Math.ceil(tank.purchasePrice * project.markup + tank.delivery);
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

cistern.calculateBaseMaterials = function (c) {
  let modelInfo = cistern.tankModels[c.model];
  c.salePrice = cistern.tankSalePrice(modelInfo);
  if (modelInfo.slimline) {
    c.paverbase = util.round('ceil', cistern.volumeRect(modelInfo.width, modelInfo.depth, c.baseHeight), 0.5);
    c.stoneType = 'cinder block';
    c.stones = cistern.calcCinderBlocks(modelInfo.width, c.baseHeight);
  } else {
    c.paverbase = util.round('ceil', cistern.volumeCyl(modelInfo.diameter, c.baseHeight), 0.5);
    c.stoneType = 'manor stone';
    c.stones = cistern.calcManorStones(modelInfo.diameter, c.baseHeight);
  }
  c.baseMaterialsCost = util.round(
    'round',
    (c.paverbase * materials.gravel.paverbase) + (c.stones * materials.stone[c.stoneType]),
    0.01
  );
};

cistern.calculateLabor = function (c) {
  c.baseLaborHr = Math.ceil((c.paverbase + c.stones) / 3);
  c.inflowLaborHr = util.round('ceil', (c.inflow / 2), 0.5);
  c.outflowLaborHr = util.round('ceil', (c.outflow / 4), 0.5);
  c.totalHr = c.baseLaborHr + c.inflowLaborHr + c.outflowLaborHr;
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

cistern.calculateLaborTotal = function(c) {
  return c.baseLaborCost + c.inflowLaborCost + c.outflowLaborCost;
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

cistern.calcGrandTotals = function() {
  cistern.laborHoursTotal = 0;
  cistern.laborCostTotal = 0;
  cistern.materialsCostTotal = 0;
  cistern.taxTotal = 0;
  cistern.grandTotal = 0;

  cistern.allCisterns.forEach(function(e) {
    cistern.laborHoursTotal += e.totalHr;
    cistern.laborCostTotal += e.laborTotal;
    cistern.materialsCostTotal += e.materialsTotal;
    cistern.taxTotal += e.tax;
    cistern.grandTotal += e.total;
  });
};

var cisternView = {
  current: {}
};

cisternView.init = function() {
  $('#cistern-content').show()
  .siblings().hide();
  //cisternView.checkDisplay();
  cisternView.handleNew();
  cisternView.handleSelector();
  cisternView.handleNav();

};

cisternView.checkDisplay = function() {
  if (cistern.allCisterns.length && $('#cistern-display').css('display') === 'none') {
    //populateSelector <=== requires refactoring populateSelector to handle multiple cisterns
    cisternView.current = $('#cistern-selector');
    $('#cistern-display').hide();
  }
};

cisternView.handleNew = function() {
  $('#cistern-add').on('click', function(e) {
    e.preventDefault();
    let newCistern = cistern.buildCistern();
    cistern.calculateBaseMaterials(newCistern);
    cistern.calculateLabor(newCistern);
    cistern.calculatePlumbingMaterials(newCistern);
    cistern.calculateTotals(newCistern);
    cistern.allCisterns.push(newCistern);
    cistern.calcGrandTotals();
    cisternView.updateDisplayWithNew(newCistern);
    cisternView.current = newCistern;
    viewUtil.clearForm();
  });
};

cisternView.updateDisplayWithNew = function(cur) {
  const $display = $('#cistern-display');
  let $selected = $('.selected').attr('id').split('-')[2];
  cisternView.populateSelector(cur);
  $('#cistern-selector').val(cur.cisternId);
  cisternView.makeTables(cur);
  if ($display.css('display') === 'none') {
    $display.show();
  }
  if ($selected != 'summary') {
    $('#cistern-nav-summary').addClass('selected')
      .siblings().removeClass('selected');
  }
  //show edit button
};

cisternView.populateSelector = function(cur) {
  let curId = cur.cisternId;
  if ($('#cistern-selector option[value="' + curId + '"]').length === 0) {
    let option = '<option value="' + curId + '">' + curId + '</option>';
    $('#cistern-selector').append(option);
  }
};

cisternView.handleSelector = function() {
  $('#cistern-selector').on('change', function(e) {
    e.preventDefault();
    let curCistern = $.grep(cistern.allCisterns, function(e) {
      return e.cisternId == $('#cistern-selector').val();
    });
    cisternView.makeTables(curCistern[0]);
    cisternView.current = curCistern[0];
  });
};

cisternView.handleNav = function() {
  $('#cistern-nav > li').on('click', function() {
    let $curNav = $('.selected').attr('id').split('-')[2];
    let $nextNav = $(this).attr('id').split('-')[2];
    $(this).addClass('selected')
      .siblings().removeClass('selected');
    if ($curNav != $nextNav) {
      let target = '#cistern-table-' + $nextNav;
      $(target).show()
        .siblings().hide();
    } else {
      return;
    }
  });
};

cisternView.makeTables = function(cur) {
  $('#cistern-table-summary').html(cisternView.makeSummary(cur));
  $('#cistern-table-labor').html(cisternView.makeLabor(cur));
  $('#cistern-table-materials').html(cisternView.makeMaterials(cur));
};

cisternView.makeSummary = function(cur) {
  let summary = '';
  summary += `
  <tr><th>Item</th><th>Cost</th></tr>
  <tr><td>Model</td><td>${cur.model}</td></tr>
  <tr><td>Labor Hrs</td><td>${cur.totalHr}</td></tr>
  <tr><td>Labor Cost</td><td>$${cur.laborTotal}</td></tr>
  <tr><td>Materials Cost</td><td>$${cur.materialsTotal}</td></tr>
  <tr><td>Tax</td><td>$${cur.tax}</td></tr>
  <tr><td>Total</td><td>$${cur.total}</td></tr>
  `;
  return summary;
};

cisternView.makeLabor = function(cur) {
  let labor = '';
  labor += `
  <tr><th>Item</th><th>Hours</th><th>Cost</th></tr>
  <tr><td>Base</td><td>${cur.baseLaborHr}</td><td>$${cur.baseLaborCost}</td></tr>
  <tr><td>Inflow</td><td>${cur.inflowLaborHr}</td><td>$${cur.inflowLaborCost}</td></tr>
  <tr><td>Outflow</td><td>${cur.outflowLaborHr}</td><td>$${cur.outflowLaborCost}</td></tr>
  <tr><td>Total</td><td>${cur.totalHr}</td><td>$${cur.laborTotal}</td></tr>
  `;
  return labor;
};

cisternView.makeMaterials = function(cur) {
  let materials = '';
  materials += `
  <tr><th>Item</th><th>Qty</th><th>Cost</th></tr>
  <tr><td>Tank</td><td>1</td><td>$${cur.salePrice}</td></tr>
  <tr><td>Gutter</td><td>${cur.gutter}ft</td><td>$${cur.gutterCost}</td></tr>
  <tr><td>Paverbase</td><td>${cur.paverbase}yd</td><td>$</td></tr>
  <tr><td>${cur.stoneType}</td><td>${cur.stones}</td><td>$</td></tr>
  <tr><td>Inflow pipe</td><td>${cur.inflow}ft</td><td>$</td></tr>
  <tr><td>Inflow hardware</td><td>${cur.inflowHardware}</td><td>$</td></tr>
  <tr><td>Outflow pipe</td><td>${cur.outflow}ft</td><td>$</td></tr>
  <tr><td>Outflow hardware</td><td>${cur.outflowHardware}</td><td>$</td></tr>
  <tr><td>Low-flow kit</td><td>1</td><td>$75.00</td></tr>
  <tr><td>Total</td><td></td><td>$${cur.materialsTotal}</td></tr>
  `;
  return materials;
};
