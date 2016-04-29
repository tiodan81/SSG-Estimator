'use strict';

var bulkView = {};

bulkView.init = function () {
  $('#bulk-content').show().siblings().hide();
  bulkView.displayExisting();
  bulkView.handleSave();
};

bulkView.displayExisting = function () {
  var $existing = project.current.bulkMaterials;

  if ($existing.all.length) {
    $('#bulk-selector').empty();

    $existing.all.forEach(function (e) {
      bulkView.populateSelector(e);
    });
    $('#bulk-selector').hide();
    $('#bulk-nav > button:first-child').addClass('button-primary').siblings().removeClass('button-primary');
    bulkView.renderSummary();
    bulkView.handleNav();
  } else {
    return;
  }
};

bulkView.handleSave = function () {
  $('#bulk-form').off('submit').on('submit', function (e) {
    e.preventDefault();
    var $val = $('#bulk-save').val();
    if ($val === 'save') {
      var dupe = bulk.preventDuplicates();
      if (dupe) {
        alert('That id has already been used. Please choose a different id.');
        return false;
      }
      bulkController.save();
      bulkView.clearForm();
    } else if ($val === 'update') {
      bulkController.save();
      bulkView.clearForm();
      $('#bulk-save').val('save');
    }
  });
};

bulkView.renderSummary = function () {
  $('#bulk-table').html(bulkView.makeSummary(project.current.bulkMaterials.uber));
  $('#bulk-selector').hide();
  if ($('#bulk-display').css('display') === 'none') {
    $('#bulk-display').show();
  }
};

bulkView.renderDetails = function (t) {
  $('#bulk-table').html(bulkView.makeDetails(t));
  if ($('#bulk-display').css('display') === 'none') {
    $('#bulk-display').show();
  }
  $('#bulk-selector').show();
  bulkView.handleSelector();
  bulkView.handleEdit();
  bulkView.handleDelete();
};

bulkView.populateSelector = function (b) {
  var cur = b.type;
  var displayCur = util.camelCaseToLowerCase(cur);

  if ($('#bulk-selector option[value="' + cur + '"]').length === 0) {
    var option = '<option value="' + cur + '">' + displayCur + '</option>';
    $('#bulk-selector').append(option);
  }
};

bulkView.handleSelector = function () {
  $('#bulk-selector').off('change').on('change', function () {
    var type = $('#bulk-selector').val();
    var curBulk = util.findObjInArray(type, project.current.bulkMaterials.all, 'type')[0];
    bulkView.renderDetails(curBulk.type);
  });
};

bulkView.handleNav = function () {
  $('#bulk-nav > button').off('click').on('click', function () {
    var $curNav = $('#bulk-nav > .button-primary').text();
    var $nextNav = $(this).text();

    if ($curNav != $nextNav) {
      $(this).addClass('button-primary').siblings().removeClass('button-primary');

      if ($nextNav === 'summary') {
        bulkView.renderSummary();
      } else if ($nextNav === 'details') {
        var $type = $('#bulk-selector').val();
        bulkView.renderDetails($type);
        bulkView.handleEdit();
        bulkView.handleDelete();
      }
    } else {
      return;
    }
  });
};

bulkView.handleEdit = function () {
  $('#bulk-table .icon-pencil2').off('click').on('click', function () {
    var curId = $(this).data('id');
    project.current.bulkMaterials.all.forEach(function (bm) {
      if (bm.id === curId) {
        bulkView.populateForm(bm);
        $('#bulk-save').val('update');
      }
    });
  });
};

bulkView.handleDelete = function () {
  $('#bulk-table .icon-bin2').off('click').on('click', function (e) {
    var $curId = $(this).data('id');
    var $curType = $(this).data('type');

    bulkController.delete($curId, $curType);
    bulkView.handleEdit();
    bulkView.handleDelete();
  });
};

//param should be uber?
bulkView.makeSummary = function (uber) {
  var summary = '<tr><th>Type</th><th>Volume</th><th>Hours</th><th>Price*</th><th>Tax</th><th>Total</th></tr>';
  var grandVol = 0;
  var grandHours = 0;
  var grandSubtotal = 0;
  var grandTax = 0;
  var grandTotal = 0;

  for (var type in uber) {
    grandVol += uber[type].volume;
    grandHours += uber[type].hours;
    grandSubtotal += uber[type].subtotal;
    grandTax += uber[type].tax;
    grandTotal += uber[type].total;
    summary += bulkView.makeSummaryRow(type, uber[type].volume, uber[type].hours, uber[type].subtotal, uber[type].tax, uber[type].total);
  }

  summary += '\n  <tr class="total-row">\n  <td>Total</td>\n  <td>' + grandVol + ' yd</td>\n  <td>' + grandHours + '</td>\n  <td class="money">$' + grandSubtotal.toFixed(2) + '</td>\n  <td class="money">$' + grandTax.toFixed(2) + '</td>\n  <td class="money">$' + grandTotal.toFixed(2) + '</td>\n  </tr>\n  ';

  return summary;
};

bulkView.makeSummaryRow = function (type, vol, hours, subtotal, tax, total) {
  return '<tr><td>' + util.camelCaseToLowerCase(type) + '</td><td>' + vol + ' yd</td><td>' + hours + '</td><td class="money">$' + subtotal.toFixed(2) + '</td><td class="money">$' + tax.toFixed(2) + '</td><td class="money">$' + total.toFixed(2) + '</td></tr>';
};

bulkView.makeDetails = function (curType) {
  var details = '<tr><th>ID</th><th>Type</th><th>Width</th><th>Length</th><th>Depth</th><th>Volume</th><th>Hours</th><th>Price*</th><th>Tax</th><th>Total</th></tr>';
  var totals = project.current.bulkMaterials.uber[curType];
  var filtered = project.current.bulkMaterials.all.filter(function (bm) {
    return bm.type === curType;
  });

  filtered.map(function (f) {
    return details += bulkView.makeRow(f);
  });

  details += '\n  <tr class="total-row">\n  <td>Totals</td>\n  <td>' + util.camelCaseToLowerCase(curType) + '</td>\n  <td></td>\n  <td></td>\n  <td></td>\n  <td>' + totals.volume + ' yd</td>\n  <td>' + totals.hours + '</td>\n  <td class="money">$' + totals.subtotal.toFixed(2) + '</td>\n  <td class="money">$' + totals.tax.toFixed(2) + '</td>\n  <td class="money">$' + totals.total.toFixed(2) + '</td>\n  </tr>';

  return details;
};

bulkView.makeRow = function (b) {
  var row = '';
  row += '\n  <tr>\n  <td>' + b.id + '</td>\n  <td>' + util.camelCaseToLowerCase(b.type) + '</td>\n  <td>' + b.widFt + '\' ' + b.widIn + '"</td>\n  <td>' + b.lenFt + '\' ' + b.lenIn + '"</td>\n  <td>' + b.depth + '"</td>\n  <td>' + b.volume + ' yd</td>\n  <td></td>\n  <td></td>\n  <td></td>\n  <td></td>\n  <td><span data-id="' + b.id + '" class="icon-pencil2"></span></td>\n  <td><span data-id="' + b.id + '" data-type="' + b.type + '" class="icon-bin2"></span></td>\n  </tr>\n  ';
  return row;
};

bulkView.populateForm = function (bm) {
  $('#bulk-id').val(bm.id);
  $('#bulk-type').val(bm.type);
  $('#bulk-width-ft').val(bm.widFt);
  $('#bulk-width-in').val(bm.widIn);
  $('#bulk-length-ft').val(bm.lenFt);
  $('#bulk-length-in').val(bm.lenIn);
  $('#bulk-depth').val(bm.depth);
};

bulkView.clearForm = function () {
  $('#bulk-form input[type="text"]').val('');
  $('#bulk-form input[type="number"]').val('');
};