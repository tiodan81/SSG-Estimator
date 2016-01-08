//process form input
  //zero inch if only ft specified
  //validate all input using .isNumeric(value)
  //convert all to inches
  //calculate volume
  //convert to yards
//display each entry after 'add'
  //display area name & dimensions *as entered* e.g. 5'6" x 4'10"
//display total after 'total' - running total in table?
//remove/edit(?) entries

allMulches = [];

function Mulch (z, wf, wi, lf, li, d) {
  this.zone = z;
  this.widFt = wf;
  this.widIn = wi;
  this.lenFt = lf;
  this.lenIn = li;
  this.depth = d;
  this.dispWidth = this.widFt + "' " + this.widIn + '"';
  this.dispLength = this.lenFt + "' " + this.lenIn + '"';
  this.volume = parseFloat((((wf * 12 + wi) * (lf * 12 + li) * d) / 46656).toFixed(2));
  allMulches.push(this);
}

var dispWidth;
var dispLength;
var volume;
var totalVolume = 0;

var $form = $('#mulchForm');
var $display = $('#display');

function addTableRow (z, w, l, d, v) {
  var html = '';
  html += `
    <tr>
      <td class="zone">${z}</td>
      <td class="width">${w}</td>
      <td class="length">${l}</td>
      <td class="depth">${d}</td>
      <td class="volume">${v}</td>
  `
  $('tr:last').before(html);
}

function updateTotalVolume (volume) {
  totalVolume += parseFloat(volume);
  $('#totalcell').text(totalVolume);
}

function clearForm () {
  $('.fe input').val('');
}

$form.on('submit', function(e) {
  e.preventDefault();
  var $zone = $('#zone').val();
  var $widFt = parseInt($('#width-ft').val());
  var $widIn = parseInt($('#width-in').val()) || 0;
  var $lenFt = parseInt($('#length-ft').val());
  var $lenIn = parseInt($('#length-in').val()) || 0;
  var $depth = parseInt($('#depth').val());
  var newMulch = new Mulch($zone, $widFt, $widIn, $lenFt, $lenIn, $depth);
  dispWidth = $widFt + "' " + $widIn + '"';
  dispLength = $lenFt + "' " + $lenIn + '"';
  volume = ((($widFt * 12 + $widIn) * ($lenFt * 12 + $lenIn) * $depth) / 46656).toFixed(2);
  addTableRow($zone, dispWidth, dispLength, $depth, volume);
  updateTotalVolume(volume);
  clearForm();
})
