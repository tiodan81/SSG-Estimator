var bulkView = {}

bulkView.init = function() {
  $('#bulk-content').show()
    .siblings().hide()
  bulkView.handleSave()
  //bulkView.handleUpdate()
//  bulkView.showTotal()
}

bulkView.renderDetails = function(b) {
  bulkView.populateSelector(b)
  $('#bulk-selector').val(b.id)

  $('#bulk-details').html(bulkView.makeDetails(b))

  if ($('#bulk-display').css('display') === 'none') {
    $('#bulk-display').show()
  }
  //bulkView.showSummary()
}

bulkView.populateSelector = function(b) {
  let cur = b.type
  if ($('#bulk-selector option[value="' + cur + '"]').length === 0) {
    let option = '<option value="' + cur + '">' + cur + '</option>'
    $('#bulk-selector').append(option)
  }
}

bulkView.showSummary = function() {
  let $selected = $('#bulk-nav .button-primary').attr('id')
  if ($selected != 'summary') {
    $('#rg-nav > #summary').addClass('button-primary')
    .siblings().removeClass('button-primary')
    $('#bulk-summary').show()
    .siblings().hide()
  }
}

bulkView.makeSummary = function(b) {
  let summary = ''
  summary +=`
  <tr><th>Type</th><th>Volume</th><th>Price</th><th>Tax</th><th>Total</th></tr>
  `
  return summary
}

bulkView.makeDetails = function(b) {
  let details = `<tr><th>ID</th><th>Type</th><th>Width</th><th>Length</th><th>Depth</th><th>Volume</th><th>Price</th><th>Tax</th><th>Total</th></tr>`

  project.current.bulkMaterials.all
    .filter((bm) => bm.type === b.type)
    .map((filtered) => {
      return details += bulkView.makeRow(filtered)
    })

  //total row
  return details
}

bulkView.makeRow = function(b) {
  let row = ''
  row += `
  <tr>
  <td>${b.id}</td>
  <td>${b.type}</td>
  <td>${b.widFt}' ${b.widIn}"</td>
  <td>${b.lenFt}' ${b.lenIn}"</td>
  <td>${b.depth}"</td>
  <td>${b.volume} yd</td>
  <td>$${b.price}</td>
  <td>$${b.tax}</td>
  <td>$${b.total}</td>
  <td><span id="${b.id}" class="icon-pencil2"></span></td>
  <td><span id="${b.id}" class="icon-bin2"></span></td>
  </tr>
  `
  return row
}

bulkView.showTotal = function() {
  if (project.current.bulkMaterials.all.length === 0) {
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
  $('#bulk-id').val(zone.id)
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
    let $val = $('#bulk-save').val()
    if ($val === 'save') {
      let dupe = bulk.preventDuplicates()
      if (dupe) {
        alert('That id has already been used. Please choose a different id.')
        return false
      }
      bulkController.save()
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
