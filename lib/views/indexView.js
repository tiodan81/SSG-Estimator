'use strict';

var indexView = {};

indexView.init = function () {
  $('#home-content').show().siblings().hide();
  if (project.current.client) {
    indexView.render(project.current);
  }
  indexView.handleCreateButton();
  indexView.handleSelector();
};

indexView.handleCreateButton = function () {
  $('#project-create-button').off('click').on('click', function (e) {
    e.preventDefault();
    $('#project-select-container').hide();
    $('#projectForm').show();
    indexView.handleProjectForm();
    indexView.handleProjectCancel();
  });
};

indexView.handleProjectForm = function () {
  $('#projectForm').off('submit').on('submit', function (e) {
    e.preventDefault();
    projectController.create();
  });
};

indexView.handleProjectCancel = function () {
  $('#project-cancel').off('click').on('click', function (e) {
    indexView.clearForm();
    $('#projectForm').hide().siblings().show();
  });
};

indexView.render = function (project) {
  $('#project-summary').show().html(indexView.makeTable(project));
};

indexView.clearForm = function () {
  $('#project-client').val('');
  $('#project-city').val('Seattle');
  $('#project-labor-rate').val('45');
  $('#project-markup-rate').val('35');
};

indexView.populateSelector = function (project) {
  var client = project.client;
  if ($('#project-selector option[value="' + client + '"]').length === 0) {
    var option = '<option value="' + client + '">' + client + '</option>';
    $('#project-selector').append(option);
  }
};

indexView.handleSelector = function () {
  $('#project-selector').off('change').on('change', function () {
    var id = $(this).val();
    if (id === 'default') {
      $('#project-summary').empty();
      return;
    } else {
      var curProject = util.findObjInArray(id, project.allProjects, 'client');
      project.current = curProject[0];
      project.populate(project.current);
      indexView.clearDisplays();
      indexView.render(project.current);
    }
  });
};

indexView.makeTable = function (cur) {
  var html = '\n    <h2>' + cur.client + '</h2>\n    <table id="project-table">\n    <tr><th>Item</th><th>Labor Hours</th><th>Labor Cost</th><th>Materials Cost</th><th>Subtotal</th><th>Tax</th><th>Total</th></tr>\n  ';

  var totals = {
    laborHours: 0,
    laborCost: 0,
    materialsCost: 0,
    subtotal: 0,
    tax: 0,
    total: 0
  };

  if (Object.keys(cur.rainwise.uber).length) {
    var rw = cur.rainwise.uber;
    var disp = [rw.subtotal, rw.tax, rw.total].map(function (e) {
      return e.toFixed(2);
    });

    totals.materialsCost += rw.subtotal;
    totals.subtotal += rw.subtotal;
    totals.tax += rw.tax;
    totals.total += rw.total;

    html += '<tr><td>Rainwise</td><td></td><td></td><td class="money">$' + disp[0] + '</td><td class="money">$' + disp[0] + '</td><td class="money">$' + disp[1] + '</td><td class="money">$' + disp[2] + '</td></tr>';
  }

  if (cur.rainGardens.all.length) {
    var rgs = cur.rainGardens.uber.totals;
    var _disp = [rgs.laborCostTotal, rgs.materialsCostTotal, rgs.subtotal, rgs.tax, rgs.total].map(function (e) {
      return e.toFixed(2);
    });

    totals.laborHours += rgs.laborHrsTotal;
    totals.laborCost += rgs.laborCostTotal;
    totals.materialsCost += rgs.materialsCostTotal;
    totals.subtotal += rgs.subtotal;
    totals.tax += rgs.tax;
    totals.total += rgs.total;
    html += '<tr><td>Rain gardens</td><td>' + rgs.laborHrsTotal + '</td><td class="money">$' + _disp[0] + '</td><td class="money">$' + _disp[1] + '</td><td class="money">$' + _disp[2] + '</td><td class="money">$' + _disp[3] + '</td><td class="money">$' + _disp[4] + '</td></tr>';
  }
  if (cur.cisterns.all.length) {
    var cisterns = cur.cisterns.uber;
    var _disp2 = [cisterns.laborCostTotal, cisterns.materialsCostTotal, cisterns.subtotal, cisterns.tax, cisterns.total].map(function (e) {
      return e.toFixed(2);
    });

    totals.laborHours += cisterns.laborHrsTotal;
    totals.laborCost += cisterns.laborCostTotal;
    totals.materialsCost += cisterns.materialsCostTotal;
    totals.subtotal += cisterns.subtotal;
    totals.tax += cisterns.tax;
    totals.total += cisterns.total;
    html += '<tr><td>Cisterns</td><td>' + cisterns.laborHrsTotal + '</td><td class="money">$' + _disp2[0] + '</td><td class="money">$' + _disp2[1] + '</td><td class="money">$' + _disp2[2] + '</td><td class="money">$' + _disp2[3] + '</td><td class="money">$' + _disp2[4] + '</td></tr>';
  }

  if (cur.bulkMaterials.all.length) {
    var uber = cur.bulkMaterials.uber;
    var hours = util.round('ceil', util.plucky('hours', project.current.bulkMaterials.uber), 0.5);
    var laborCost = util.round('round', util.plucky('laborCost', project.current.bulkMaterials.uber), 0.01);
    var materialCost = util.round('round', util.plucky('materialCost', project.current.bulkMaterials.uber), 0.01);
    var subtotal = util.round('round', util.plucky('subtotal', project.current.bulkMaterials.uber), 0.01);
    var tax = util.round('round', util.plucky('tax', project.current.bulkMaterials.uber), 0.01);
    var total = util.round('round', util.plucky('total', project.current.bulkMaterials.uber), 0.01);

    totals.laborHours += hours;
    totals.laborCost += laborCost;
    totals.materialsCost += materialCost;
    totals.subtotal += subtotal;
    totals.tax += tax;
    totals.total += total;
    html += '\n    <tr>\n    <td>Bulk materials</td>\n    <td>' + hours + '</td>\n    <td class="money">$' + laborCost.toFixed(2) + '</td>\n    <td class="money">$' + materialCost.toFixed(2) + '</td>\n    <td class="money">$' + subtotal.toFixed(2) + '</td>\n    <td class="money">$' + tax.toFixed(2) + '</td>\n    <td class="money">$' + total.toFixed(2) + '</td>\n    </tr>';
  }

  for (var prop in totals) {
    if (prop !== 'laborHours') {
      totals[prop] = totals[prop].toFixed(2);
    }
  }

  html += '\n  <tr class="total-row"><td>Total</td><td>' + totals.laborHours + ' hrs</td><td class="money">$' + totals.laborCost + '</td><td class="money">$' + totals.materialsCost + '</td><td class="money">$' + totals.subtotal + '</td><td class="money">$' + totals.tax + '</td><td class="money">$' + totals.total + '</td></tr>\n  </table>\n  ';
  return html;
};

indexView.clearDisplays = function () {
  $('#project-summary').html('');
  $('#rainwise-table').html('');
  $('#rg-selector').html('');
  $('#rg-tables table').html('');
  $('#rg-display').hide();
  $('#bulk-selector').html('');
  $('#bulk-table').html('');
  $('#bulk-display').hide();
  $('#cistern-selector').html('');
  $('#cistern-tables table').html('');
  $('#cistern-display').hide();
};