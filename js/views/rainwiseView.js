var rainwiseView = {}

rainwiseView.init = function() {
  $('#rainwise-content').show()
    .siblings().hide()
  rainwiseView.handleSave()
}

rainwiseView.handleSave = function() {
  $('#rainwiseForm').off('submit').on('submit', function(e) {
    e.preventDefault()
    let $val = $('#rainwise-save').val()
    if ($val === 'save') {
      rainwiseController.save()
      rainwiseView.clearForm()
    }
  })
}

rainwiseView.render = function(rw) {
  $('#rainwise-table').html(rainwiseView.makeTable(rw))
  if ($('#rainwise-display').css('display') === 'none') {
    $('#rainwise-display').show()
  }
  //edit/delete buttons?
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
