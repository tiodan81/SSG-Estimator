var rainwiseView = {}

rainwiseView.init = function() {
  $('#rainwise-content').show()
    .siblings().hide()
  rainwiseView.displayExisting()
  rainwiseView.handleSave()
}

rainwiseView.displayExisting = function() {
  let $existing = project.current.rainwise.uber
  if (Object.keys($existing).length) {
    rainwiseView.render($existing)
  } else {
    $('#rainwise-edit-buttons').hide()
  }
}

rainwiseView.handleSave = function() {
  $('#rainwiseForm').off('submit').on('submit', function(e) {
    e.preventDefault()
    let $val = $('#rainwise-save').val()
    if ($val === 'save') {
      rainwiseController.save()
    } else if ($val === 'update') {
      rainwiseController.save()
      $('#rainwise-save').val('save')
    }
  })
}

rainwiseView.render = function(rw) {
  $('#rainwise-table').html(rainwiseView.makeTable(rw))
  if ($('#rainwise-display').css('display') === 'none') {
    $('#rainwise-display').show()
  }
  rainwiseView.handleEdit()
}

rainwiseView.handleEdit = function() {
  $('#rainwise-edit-buttons .icon-pencil2').off('click').on('click', function(e) {
    rainwiseView.populateForm(project.current.rainwise.uber)
    $('#rainwise-save').val('update')
  })
}

rainwiseView.populateForm = function(rw) {
  $('#gutterFt').val(rw.gutterLength)
  $('#rw-inspection').prop('checked', rw.inspection)
}

rainwiseView.makeTable = function(rw) {
  let table = `<tr><th>Item</th><th>Amount</th><th>Cost</th><th>Tax</th><th>Total</th></tr>`
  if (rw.gutterLength) {
    table += `<tr><td>Gutter</td><td>${rw.gutterLength} ft</td><td>$${rw.gutterCost}</td><td>$${rw.gutterTax}</td><td>$${rw.gutterTotal}</td></tr>`
  }
  if (rw.inspection) {
    table += `<tr><td>Inspection</td><td></td><td>$${rw.inspectionCost}</td><td></td><td>$${rw.inspectionCost}</td></tr>`
  }
  table += `<tr class="total-row"><td>Total</td><td></td><td>$${rw.subtotal}</td><td>$${rw.gutterTax}</td><td>$${rw.total}</td></tr>`
  return table
}

rainwiseView.clearForm = function() {
  $('#gutterFt').val('')
  $('#rw-inspection').prop('checked', false)
}
