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

var Project = {
  name: '',
  totalVolume: 0
};

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

var $form = $('#mulchForm');
var $display = $('#display');

function addTableRow (z, w, l, d, v) {
  var html = '';
  html += `
    <tr>
      <td class="zone">${z}</td>
      <td class="width">${w}</td>
      <td class="length">${l}</td>
      <td class="depth">${d}"</td>
      <td class="volume">${v} yd</td>
      <td><span class="icon-pencil2"></span></td>
      <td><span class="icon-bin2"></span></td>
    </tr>
  `
  $('tr:last').before(html);
}
//
// <span class="icon-bin2"></span>

function updateTotalVolume (volume) {
  Project.totalVolume += parseFloat(volume);
  $('#totalcell').text(Project.totalVolume + ' yd');
}

function clearForm () {
  $('.fe input').val('');
}

function showTotal() {
  if (allMulches.length === 0) {
    $('#totalrow').hide();
  } else {
    $('#totalrow').show();
  }
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
  addTableRow(newMulch.zone, newMulch.dispWidth, newMulch.dispLength, newMulch.depth, newMulch.volume);
  updateTotalVolume(newMulch.volume);
  showTotal();
  clearForm();
})

$(function() {
  showTotal();
});
