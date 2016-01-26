var mulch = {
  zoneId: 0,          //reset to mulchZones.length on first page load
  totalVolume: 0,
  totalPrice: 0,
  mulchZones: [],
  mulchPrices: {
    bark: 10,
    chips: 20,
    GroCo: 30
  }
};

function MulchZone (i, z, t, wf, wi, lf, li, d, p) {
  this.id = i;
  this.zone = z;
  this.type = t;
  this.widFt = wf;
  this.widIn = wi;
  this.lenFt = lf;
  this.lenIn = li;
  this.depth = d;
  this.dispWidth = this.widFt + "' " + this.widIn + '"';
  this.dispLength = this.lenFt + "' " + this.lenIn + '"';
  this.volume = parseFloat((((wf * 12 + wi) * (lf * 12 + li) * d) / 46656).toFixed(2));
  this.price = parseFloat((this.volume * p).toFixed(2));
}

mulch.updateTotals = function() {
  mulch.totalVolume = 0;
  mulch.totalPrice = 0;
  mulch.mulchZones.forEach(function(e) {
    mulch.totalVolume += e.volume;
    mulch.totalPrice += e.price;
  });
  $('#totalVol').text(mulch.totalVolume + ' yd');
  $('#totalPrice').text('$' + mulch.totalPrice);
};

mulch.findReplace = function(updated) {
  mulch.mulchZones.forEach(function(zone, i) {
    if (zone.id === updated.id) {
      mulch.mulchZones[i] = updated;
    }
  });
};

mulch.buildMulch = function(id) {
  var $zone = $('#zone').val();
  var $type = $('#type').val();
  var $widFt = parseInt($('#width-ft').val());
  var $widIn = parseInt($('#width-in').val()) || 0;
  var $lenFt = parseInt($('#length-ft').val());
  var $lenIn = parseInt($('#length-in').val()) || 0;
  var $depth = parseInt($('#depth').val());
  var curPrice = mulch.mulchPrices[$type];
  return new MulchZone(id, $zone, $type, $widFt, $widIn, $lenFt, $lenIn, $depth, curPrice);
};

mulch.listen = function() {
  mulchView.makeTable();
  mulch.updateTotals();
  mulchView.showTotal();
  mulchView.editZone();
  mulchView.deleteZone();
};

var mulchView = {};

mulchView.init = function() {
  $('#mulch-content').show()
  .siblings().hide();
  mulchView.handleNew();
  mulchView.handleUpdate();
  mulchView.showTotal();
};

mulchView.makeTable = function() {
  $('tbody').empty();
  mulch.mulchZones.forEach(function(zone) {
    var html = '';
    html += `
    <tr>
    <td class="zone">${zone.zone}</td>
    <td class="type">${zone.type}</td>
    <td class="width">${zone.dispWidth}</td>
    <td class="length">${zone.dispLength}</td>
    <td class="depth">${zone.depth}"</td>
    <td class="volume">${zone.volume} yd</td>
    <td class="price">$${zone.price}</td>
    <td><span id="${zone.id}" class="icon-pencil2"></span></td>
    <td><span id="${zone.id}" class="icon-bin2"></span></td>
    </tr>
    `;
    $('tbody').append(html);
  });
};

mulchView.showTotal = function() {
  if (mulch.mulchZones.length === 0) {
    $('#totalrow').hide();
    $('#save-mulch').hide();
  } else {
    $('#totalrow').show();
    $('#save-mulch').show();
  }
};

mulchView.editZone = function() {
  $('.icon-pencil2').on('click', function() {
    var curId = $(this).attr('id');
    mulch.mulchZones.forEach(function(zone) {
      if (zone.id === parseInt(curId)) {
        mulchView.populateForm(zone);
        $('#mulch-add').hide();
        $('#mulch-update').show().data('id', curId);
      }
    });
  });
};

mulchView.populateForm = function(zone) {
  $('#zone').val(zone.zone);
  $('#width-ft').val(zone.widFt);
  $('#width-in').val(zone.widIn);
  $('#length-ft').val(zone.lenFt);
  $('#length-in').val(zone.lenIn);
  $('#depth').val(zone.depth);
};

mulchView.handleNew = function() {
  $('#mulch-add').on('click', function(e) {
    e.preventDefault();
    var newMulchZone = mulch.buildMulch(mulch.zoneId);
    mulch.mulchZones.push(newMulchZone);
    mulch.zoneId += 1;
    mulch.listen();
    viewUtil.clearForm();
  });
};

mulchView.handleUpdate = function() {
  $('#mulch-update').on('click', function(e) {
    e.preventDefault();
    var curId = parseInt($(this).data('id'));
    var updated = mulch.buildMulch(curId);
    mulch.findReplace(updated);
    mulch.listen();
    viewUtil.clearForm();
    $('#mulch-update').hide();
    $('#mulch-add').show();
  });
};

mulchView.deleteZone = function() {
  $('.icon-bin2').on('click', function(e) {
    e.preventDefault();
    var curId = parseInt($(this).attr('id'));
    mulch.mulchZones.forEach(function(zone, i) {
      if (zone.id === curId) {
        mulch.mulchZones.splice(i, 1);
      }
    });
    mulch.listen();
  });
};

$(function() {
  project.saveName();
  $('#new-user-form').submit(user.create);
  $('#login-form').submit(user.authLogin);
});
