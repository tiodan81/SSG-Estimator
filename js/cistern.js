var cistern = {
  laborHoursTotal: 0,
  laborCostTotal: 0,
  materialsCostTotal: 0,
  taxTotal: 0,
  grandTotal: 0,
  allCisterns: [],
  tankModels: []
};

function cisternMaker (ci, ra, m, h, g, inf, out, al) {
  this.cisternId = ci || 'UBER';
  this.roofArea = ra || 0;
  this.model = m || '';
  this.baseHeight = h || 0;
  this.gutter = g || 0;
  this.inflow = inf || 0;
  this.outflow = out || 0;
  this.additionalLaborHr = al || 0;
  this.paverbase = 0;
  this.stoneType = '';
  this.stones = 0;
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
  this.stoneCost = 0;
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
    return Math.ceil(info.purchasePrice * project.markup + info.delivery);
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
    labor = 4 + Math.ceil((c.paverbase + c.stones) / 3);
  } else {
    labor = 10 + Math.ceil((c.paverbase + c.stones) / 3);
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
    c.stones = cistern.calcCinderBlocks(modelInfo.width, c.baseHeight);
    c.slimlineRestraints = materials.plumbing.slimlineRestraints;
  } else {
    c.paverbase = util.round('ceil', cistern.volumeCyl(modelInfo.diameter, c.baseHeight), 0.5);
    c.stoneType = 'Manor stone';
    c.stones = cistern.calcManorStones(modelInfo.diameter, c.baseHeight);
    c.slimlineRestraints = 0;
  }
  c.bulkheadKit = c.model.charAt(0) === 'p' ? materials.plumbing.bulkheadKit : 0;
  c.paverbaseCost = util.round('round', (c.paverbase * materials.gravel.paverbase), 0.01);
  c.stoneCost = util.round('round', (c.stones * materials.stone[c.stoneType]), 0.01);
  c.baseMaterialsCost = util.round('round', c.paverbaseCost + c.stoneCost + c.slimlineRestraints + c.bulkheadKit, 0.01);
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

cistern.allCalcs = function(cur) {
  cistern.calculateBaseMaterials(cur);
  cistern.calculateLabor(cur);
  cistern.calculatePlumbingMaterials(cur);
  cistern.calculateTotals(cur);
  cistern.calcGrandTotals();
};

var cisternView = {
  current: {}
};

cisternView.init = function() {
  $('#cistern-content').show()
  .siblings().hide();
  //cisternView.checkDisplay();
  cisternView.handleNew();
  //cisternView.handleAddOns();
  cisternView.handleSelector();
  cisternView.handleNav();
  cisternView.handleUpdate();
  cisternView.handleDelete();
};

cisternView.checkDisplay = function() {
  if (cistern.allCisterns.length && $('#cistern-display').css('display') === 'none') {
    //populateSelector <=== requires refactoring populateSelector to handle multiple cisterns
    //cisternView.current = $('#cistern-selector'); <==== this ain't right
    $('#cistern-display').hide();
  }
};

cisternView.handleAddOns = function() {
  $('#cisternAddOns').on('change', function() {
    let addOn = $(this).val();
    let count = $("'#" + addOn + "'").data('count');
    count = count != 0 ? count : 1;
    //let count = $("'#" + addOn + "'").length ? cisternView.getAddOnCount(addOn) + 1 : 1;
    $(this).parent().after(cisternView.makeAddOn(addOn, count));
  });
};

cisternView.getAddOnCount = function(a) {
  return $("'#" + a + "'").data('count');
};

cisternView.makeAddOn = function(addOn, count) {
  let html = '';
  html += `<div class="fe">
  <label id="${addOn}" data-count="${count} class="fieldname">${count} -</label>
  <p>${addOn}</p>
  `;
  return html;
};

cisternView.handleNew = function() {
  $('#cistern-add').on('click', function(e) {
    e.preventDefault();
    let newCistern = cistern.buildCistern();
    cistern.allCalcs(newCistern);
    cistern.allCisterns.push(newCistern);
    if (cistern.allCisterns.length > 1) {
      //make ubertank
      //add to selector - don't make current!
    }
    cisternView.updateDisplayWithNew(newCistern);
    cisternView.current = newCistern;
    viewUtil.clearForm();
  });
};

cisternView.updateDisplayWithNew = function(cur) {
  const $display = $('#cistern-display');
  cisternView.populateSelector(cur);
  $('#cistern-selector').val(cur.cisternId);
  cisternView.makeTables(cur);
  if ($display.css('display') === 'none') {
    $display.show();
  }
  cisternView.showSummary();
  cisternView.editButtons(cur);
};

cisternView.showSummary = function() {
  let $selected = $('.selected').attr('id').split('-')[2];
  if ($selected != 'summary') {
    $('#cistern-nav-summary').addClass('selected')
      .siblings().removeClass('selected');
    $('#cistern-table-summary').show()
      .siblings().hide();
  }
};

cisternView.populateSelector = function(cur) {
  let curId = cur.cisternId;
  if ($('#cistern-selector option[value="' + curId + '"]').length === 0) {
    let option = '<option value="' + curId + '">' + curId + '</option>';
    $('#cistern-selector').append(option);
  }
};

cisternView.handleSelector = function() {
  $('#cistern-selector').on('change', function() {
    let curCistern = $.grep(cistern.allCisterns, function(e) {
      return e.cisternId == $('#cistern-selector').val();
    });
    cisternView.makeTables(curCistern[0]);
    cisternView.current = curCistern[0];
    cisternView.showSummary();
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
  <tr><td>Roof area</td><td>${cur.roofArea} ft²</td></tr>
  <tr><td>Labor hours</td><td>${cur.totalHr}</td></tr>
  <tr><td>Labor cost</td><td>$${cur.laborTotal}</td></tr>
  <tr><td>Materials cost</td><td>$${cur.materialsTotal}</td></tr>
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
  `;
  if (cur.additionalLaborHr) {
    labor += `<tr><td>Additional</td><td>${cur.additionalLaborHr}</td><td>$${cur.additionalLaborCost}</td></tr>`;
  }
  labor += `<tr><td>Total</td><td>${cur.totalHr}</td><td>$${cur.laborTotal}</td></tr>`;
  return labor;
};

cisternView.makeMaterials = function(cur) {
  let materials = '';
  materials += `
  <tr><th>Item</th><th>Qty</th><th>Cost</th></tr>
  <tr><td>Tank</td><td>1</td><td>$${cur.salePrice}</td></tr>
  <tr><td>Gutter</td><td>${cur.gutter}ft</td><td>$${cur.gutterCost}</td></tr>
  <tr><td>Paverbase</td><td>${cur.paverbase}yd</td><td>$${cur.paverbaseCost}</td></tr>
  <tr><td>${cur.stoneType}</td><td>${cur.stones}</td><td>$${cur.stoneCost}</td></tr>
  <tr><td>Inflow pipe</td><td>${cur.inflow}ft</td><td>$${cur.inflowPipeCost}</td></tr>
  <tr><td>Inflow hardware</td><td>${cur.inflowHardware}</td><td>$${cur.inflowHdwCost}</td></tr>
  <tr><td>Outflow pipe</td><td>${cur.outflow}ft</td><td>$${cur.outflowPipeCost}</td></tr>
  <tr><td>Outflow hardware</td><td>${cur.outflowHardware}</td><td>$${cur.outflowHdwCost}</td></tr>
  `;
  if (cur.slimlineRestraints) {
    materials += `<tr><td>Slimeline restraints</td><td>1</td><td>$${cur.slimlineRestraints}</td></tr>`;
  }
  if (cur.bulkheadKit) {
    materials += `<tr><td>Bulkhead kit</td><td>1</td><td>$${cur.bulkheadKit}</td></tr>`;
  }
  materials += `
  <tr><td>Low-flow kit</td><td>1</td><td>$75.00</td></tr>
  <tr><td>Total</td><td></td><td>$${cur.materialsTotal}</td></tr>
  `;
  return materials;
};

cisternView.editButtons = function(cur) {
  let buttons = '';
  buttons += `
  <span id="${cur.cisternId}" class="icon-pencil2"></span>
  <span id="${cur.cisternId}" class="icon-bin2"></span>
  `;
  $('#cistern-edit-buttons').empty().html(buttons);
  cisternView.handleEdit();
  cisternView.handleDelete();
};

cisternView.handleEdit = function() {
  $('#cistern-edit-buttons .icon-pencil2').on('click', function(e) {
    e.preventDefault();
    let cur = cisternView.current;
    cisternView.populateForm(cur);
    $('#cistern-add').hide();
    $('#cistern-update').show();
  });
};

cisternView.handleUpdate = function() {
  $('#cistern-update').on('click', function(e) {
    e.preventDefault();
    let old = cisternView.current;
    let updated = cistern.buildCistern();
    cistern.allCalcs(updated);
    cistern.allCisterns.forEach(function(c, i) {
      if (updated.cisternId === c.cisternId) {
        cistern.allCisterns[i] = updated;
      }
    });
    cisternView.updateDisplayWithNew(updated);
    cisternView.current = updated;
    viewUtil.clearForm();
    $('#cistern-update').hide();
    $('#cistern-add').show();
  });
};

cisternView.handleDelete = function() {
  $('#cistern-edit-buttons .icon-bin2').on('click', function(e) {
    e.preventDefault();
    let old = cisternView.current;
    let all = cistern.allCisterns;
    all.forEach(function(e, i) {
      if (e.cisternId === old.cisternId) {
        all.splice(i, 1);
      }
    });
    $('#cistern-selector > option[value="' + old.cisternId + '"]').remove();
    if (all.length) {
      cisternView.current = all[0];
      cur = cisternView.current;
      $('#cistern-selector').val(cur.cisternId);
      cisternView.makeTables(cur);
      cisternView.showSummary();
      cisternView.editButtons(cur);
    } else {
      cisternView.current = {};
      $('#cistern-display').hide();
    };
  });

};

cisternView.populateForm = function(cur) {
  $('#cistern').val(cur.cisternId);
  $('#roofArea').val(cur.roofArea);
  $('#cisternModel').val(cur.model);
  $('#cisternBase').val(cur.baseHeight);
  $('#gutterFt').val(cur.gutter);
  $('#cisternInflow').val(cur.inflow);
  $('#cisternOutflow').val(cur.outflow);
  $('#cisternAddLabor').val(cur.additionalLaborHr);
};

cistern.makeUberTank = function(arr) {
  let obj = new cisternMaker();
  console.log(obj);
  arr.forEach(function(e) {
    Object.keys(e).forEach(function(prop) {
      console.log('obj[prop]: '+ obj[prop]);
      console.log('e[prop]: ' + e[prop]);
      obj[prop] += e[prop];
    }, obj);
  });
  return obj;
};
