var bulkView = {}

bulkView.init = function() {
  $('#bulk-content').show()
    .siblings().hide()
  bulkView.handleSave()
  //bulkView.handleUpdate()
  bulkView.showTotal()
}

bulkView.makeTable = function() {
  $('#mulch-table-body').empty()
  mulch.mulchZones.forEach(function(zone) {
    var html = ''
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
    `
    $('#mulch-table-body').append(html)
  })
}

bulkView.showTotal = function() {
  if (mulch.mulchZones.length === 0) {
    $('#mulch-totalrow').hide()
    $('#save-mulch').hide()
  } else {
    $('#mulch-totalrow').show()
    $('#save-mulch').show()
  }
}

bulkView.editZone = function() {
  $('#mulch-table-body .icon-pencil2').off('click').on('click', function() {
    var curId = $(this).attr('id')
    mulch.mulchZones.forEach(function(zone) {
      if (zone.id === parseInt(curId)) {
        bulkView.populateForm(zone)
        $('mulch-save').val('update').data('id', curId)
        //$('#mulch-update').show().data('id', curId)
      }
    })
  })
}

bulkView.populateForm = function(zone) {
  $('#bulk-zone').val(zone.id)
  $('#bulk-type').val(zone.type)
  $('#width-ft').val(zone.widFt)
  $('#width-in').val(zone.widIn)
  $('#length-ft').val(zone.lenFt)
  $('#length-in').val(zone.lenIn)
  $('#depth').val(zone.depth)
}

bulkView.handleSave = function() {
  $('#bulk-form').off('submit').on('submit', function(e) {
    e.preventDefault()
    let $val = $('#mulch-save').val()
    if ($val === 'save') {
      let newMulchZone = mulch.buildMulch(mulch.zoneId)
      mulch.mulchZones.push(newMulchZone)
      mulch.zoneId += 1
      mulch.listen()
      bulkView.clearForm()
    } else if ($val === 'update') {
      let curId = parseInt($(this).data('id'))
      let updated = mulch.buildMulch(curId)
      mulch.findReplace(updated)
      mulch.listen()
      bulkView.clearForm()
      $val = 'save'
    } else {
      console.log('error: no mulch match.')
    }
  })
}

bulkView.clearForm = function() {
  $('#bulk-form input[type="text"]').val('')
  $('#bulk-form input[type="number"]').val('')
}

// bulkView.handleUpdate = function() {
//   $('#mulch-update').off('submit').on('submit', function(e) {
//     e.preventDefault();
//     var curId = parseInt($(this).data('id'));
//     var updated = mulch.buildMulch(curId);
//     mulch.findReplace(updated);
//     mulch.listen();
//     bulkView.clearForm();
//     $('#mulch-update').hide();
//     $('#mulch-add').show();
//   });
// };

bulkView.deleteZone = function() {
  $('#mulch-table-body .icon-bin2').off('click').on('click', function(e) {
    e.preventDefault()
    var curId = parseInt($(this).attr('id'))
    mulch.mulchZones.forEach(function(zone, i) {
      if (zone.id === curId) {
        mulch.mulchZones.splice(i, 1)
      }
    })
    mulch.listen()
  })
}
