var Project = {
  name: '',
  id: 0,
  totalVolume: 0,
  allZones: []
};

function Mulch (i, z, wf, wi, lf, li, d) {
  this.id = i;
  this.zone = z;
  this.widFt = wf;
  this.widIn = wi;
  this.lenFt = lf;
  this.lenIn = li;
  this.depth = d;
  this.dispWidth = this.widFt + "' " + this.widIn + '"';
  this.dispLength = this.lenFt + "' " + this.lenIn + '"';
  this.volume = parseFloat((((wf * 12 + wi) * (lf * 12 + li) * d) / 46656).toFixed(2));
  Project.allZones.push(this);
}

function addTableRow (i, z, w, l, d, v) {
  var html = '';
  html += `
    <tr>
      <td class="zone">${z}</td>
      <td class="width">${w}</td>
      <td class="length">${l}</td>
      <td class="depth">${d}"</td>
      <td class="volume">${v} yd</td>
      <td><span id="z${i}" class="icon-pencil2"></span></td>
      <td><span class="icon-bin2"></span></td>
    </tr>
  `
  $('tr:last').before(html);
}

function updateTotalVolume (volume) {
  Project.totalVolume += parseFloat(volume);
  $('#totalcell').text(Project.totalVolume + ' yd');
}

function clearForm () {
  $('.fe input').val('');
}

function showTotal() {
  if (Project.allZones.length === 0) {
    $('#totalrow').hide();
  } else {
    $('#totalrow').show();
  }
}

function editZone() {
  $('.icon-pencil2').on('click', function() {
    var curId = $(this).attr('id').slice(1);
    Project.allZones.forEach(function(zone) {
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
  //return Mulch{}
}

$('#mulchForm').on('submit', function(e) {
  e.preventDefault();
  var $zone = $('#zone').val();
  var $widFt = parseInt($('#width-ft').val());
  var $widIn = parseInt($('#width-in').val()) || 0;
  var $lenFt = parseInt($('#length-ft').val());
  var $lenIn = parseInt($('#length-in').val()) || 0;
  var $depth = parseInt($('#depth').val());
  var newMulch = new Mulch(Project.id, $zone, $widFt, $widIn, $lenFt, $lenIn, $depth);
  addTableRow(Project.id, newMulch.zone, newMulch.dispWidth, newMulch.dispLength, newMulch.depth, newMulch.volume);
  updateTotalVolume(newMulch.volume);
  Project.id += 1;
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
