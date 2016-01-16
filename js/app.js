var project = {
  name: ''
};

var mulch = {
  zoneId: 0,
  totalVolume: 0,
  totalPrice: 0,
  mulchZones: [],
}

var mulchPrices = {
  bark: 10,
  chips: 20,
  GroCo: 30
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

mulch.makeTable = function() {
  $('tbody').empty();
  mulch.mulchZones.forEach(function(zone) {
    var html = '';
    html += `
    <tr id="mz${zone.id}">
    <td class="zone">${zone.zone}</td>
    <td class="type">${zone.type}</td>
    <td class="width">${zone.dispWidth}</td>
    <td class="length">${zone.dispLength}</td>
    <td class="depth">${zone.depth}"</td>
    <td class="volume">${zone.volume} yd</td>
    <td class="price">$${zone.price}</td>
    <td><span id="mz${zone.id}" class="icon-pencil2"></span></td>
    <td><span class="icon-bin2"></span></td>
    </tr>
    `
    $('tbody').append(html);
  });
}

mulch.updateTotals = function(volume, price) {
  mulch.totalVolume = 0;
  mulch.totalPrice = 0;
  mulch.mulchZones.forEach(function(e) {
    mulch.totalVolume += e.volume;
    mulch.totalPrice += e.price;
  })
  $('#totalVol').text(mulch.totalVolume + ' yd');
  $('#totalPrice').text('$' + mulch.totalPrice);
}

function clearForm () {
  $('.fe input').val('');
}

mulch.showTotal = function() {
  if (mulch.mulchZones.length === 0) {
    $('#totalrow').hide();
    $('#save-mulch').hide();
  } else {
    $('#totalrow').show();
    $('#save-mulch').show();
  }
}

mulch.editZone = function() {
  $('.icon-pencil2').on('click', function() {
    var curId = $(this).attr('id').slice(2);
    mulch.mulchZones.forEach(function(zone) {
      if (zone.id === parseInt(curId)) {
        mulch.populateForm(zone);
        $('#mulch-add').hide();
        $('#mulch-update').show().data('id', curId);
      } else {
        alert('No matching zone found.');
      }
    });
  });
}

mulch.populateForm = function(zone) {
  $('#zone').val(zone.zone);
  $('#width-ft').val(zone.widFt);
  $('#width-in').val(zone.widIn);
  $('#length-ft').val(zone.lenFt);
  $('#length-in').val(zone.lenIn);
  $('#depth').val(zone.depth);
}

mulch.findReplace = function(updated) {
  mulch.mulchZones.forEach(function(zone, i) {
    if (zone.id === updated.id) {
      mulch.mulchZones[i] = updated;
    } else {
      alert('No matching zone found.')
    }
  });
}

mulch.buildMulch = function(id) {
  console.log(id);
  var $zone = $('#zone').val();
  var $type = $('#type').val();
  var $widFt = parseInt($('#width-ft').val());
  var $widIn = parseInt($('#width-in').val()) || 0;
  var $lenFt = parseInt($('#length-ft').val());
  var $lenIn = parseInt($('#length-in').val()) || 0;
  var $depth = parseInt($('#depth').val());
  var curPrice = mulchPrices[$type];
  return new MulchZone(id, $zone, $type, $widFt, $widIn, $lenFt, $lenIn, $depth, curPrice);
}

mulch.handleNew = function() {
  $('#mulch-add').on('click', function(e) {
    e.preventDefault();
    var newMulchZone = mulch.buildMulch(mulch.zoneId);
    mulch.mulchZones.push(newMulchZone);
    console.log(newMulchZone);
    mulch.makeTable();
    mulch.updateTotals(newMulchZone.volume, newMulchZone.price);
    mulch.zoneId += 1;
    mulch.showTotal();
    mulch.editZone();
    clearForm();
  });
}

mulch.handleUpdate = function() {
  $('#mulch-update').on('click', function(e) {
    console.log('updating');
    e.preventDefault();
    var curId = parseInt($(this).data('id'));
    console.log(curId);
    var updated = mulch.buildMulch(curId);
    console.log(updated);
    mulch.findReplace(updated);
    mulch.makeTable();
    mulch.updateTotals(updated.volume, updated.price);
    mulch.showTotal();
    clearForm();
    $('#mulch-update').hide();
    $('#mulch-add').show();
  })
}

mulch.handleDelete = function() {

}

project.saveName = function() {
  $('#projectForm').on('submit', function(e) {
    e.preventDefault();
    project.name = $('#projectName').val();
  });
}

$(function() {
  project.saveName();
  mulch.handleNew();
  mulch.handleUpdate();
  mulch.showTotal();
});
