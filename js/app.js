var Project = {
  name: ''
};

var mulch = {
  zoneId: 0,
  totalVolume: 0,
  totalPrice: 0,
  mulchZones: [],
  editing: false
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
  mulch.mulchZones.push(this);
}

function addTableRow (i, z, t, w, l, d, v, p) {
  var html = '';
  html += `
    <tr>
      <td class="zone">${z}</td>
      <td class="type">${t}</td>
      <td class="width">${w}</td>
      <td class="length">${l}</td>
      <td class="depth">${d}"</td>
      <td class="volume">${v} yd</td>
      <td class="price">$${p}</td>
      <td><span id="mz${i}" class="icon-pencil2"></span></td>
      <td><span class="icon-bin2"></span></td>
    </tr>
  `
  $('#totalrow').before(html);
}

function updateTotals (volume, price) {
  mulch.totalVolume += volume;
  mulch.totalPrice += price;
  $('#totalVol').text(mulch.totalVolume + ' yd');
  $('#totalPrice').text('$' + mulch.totalPrice);
}

function clearForm () {
  $('.fe input').val('');
}

function showTotal() {
  if (mulch.mulchZones.length === 0) {
    $('#totalrow').hide();
    $('#save-mulch').hide();
  } else {
    $('#totalrow').show();
    $('#save-mulch').show();
  }
}

function editZone() {
  $('.icon-pencil2').on('click', function() {
    mulch.editing = true;
    var curId = $(this).attr('id').slice(1);
    mulch.mulchZones.forEach(function(zone) {
      if (zone.id === parseInt(curId)) {
        populateForm(zone);
      }
    });
  });
}

function populateForm(zone) {
  $('#zone').val(zone.zone);
  $('#width-ft').val(zone.widFt);
  $('#width-in').val(zone.widIn);
  $('#length-ft').val(zone.lenFt);
  $('#length-in').val(zone.lenIn);
  $('#depth').val(zone.depth);
  //set ID, overwrite original object
  //don't increment Project.id when handling resubmit
  //return MulchZone{}
}

$('#mulchForm').on('submit', function(e) {
  e.preventDefault();
  var $zone = $('#zone').val();
  var $type = $('#type').val();
  var $widFt = parseInt($('#width-ft').val());
  var $widIn = parseInt($('#width-in').val()) || 0;
  var $lenFt = parseInt($('#length-ft').val());
  var $lenIn = parseInt($('#length-in').val()) || 0;
  var $depth = parseInt($('#depth').val());
  var curPrice = mulchPrices[$type];
  var newMulchZone = new MulchZone(mulch.zoneId, $zone, $type, $widFt, $widIn, $lenFt, $lenIn, $depth, curPrice);
  console.log(newMulchZone);
  addTableRow(mulch.zoneId, newMulchZone.zone, newMulchZone.type, newMulchZone.dispWidth, newMulchZone.dispLength, newMulchZone.depth, newMulchZone.volume, newMulchZone.price);
  updateTotals(newMulchZone.volume, newMulchZone.price);
  mulch.zoneId += 1;
  showTotal();
  editZone();
  clearForm();
})

$('#projectForm').on('submit', function(e) {
  e.preventDefault();
  Project.name = $('#projectName').val();
})

$(function() {
  showTotal();
});
