const $ = require('jquery')
const project = require('../models/project')
const rainwiseController = require('../controllers/rainwiseController')

const init = function() {
  $('#rainwise-content').show()
    .siblings().hide()
  displayExisting()
  handleSave()
}

const displayExisting = function() {
  let existing = project.current.rainwise.uber
  if (Object.keys(existing).length) {
    render(existing)
  } else {
    $('#rainwise-edit-buttons').hide()
  }
}

const handleSave = function() {
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

const render = function(rw) {
  $('#rainwise-table').html(makeTable(rw))
  if ($('#rainwise-display').css('display') === 'none') {
    $('#rainwise-display').show()
  }
  handleEdit()
  handleDelete()
}

const handleEdit = function() {
  $('#rainwise-edit-buttons .icon-pencil2').off('click').on('click', function(e) {
    populateForm(project.current.rainwise.uber)
    $('#rainwise-save').val('update')
  })
}

const handleDelete = function() {
  $('#rainwise-edit-buttons .icon-bin2').off('click').on('click', function(e) {
    project.current.rainwise.uber = {}
    $('#rainwise-table').empty()
    $('#rainwise-display').hide()
    $('#rainwise-edit-buttons').hide()
  })
}

const populateForm = function(rw) {
  $('#gutterFt').val(rw.gutterLength)
  $('#rw-inspection').prop('checked', rw.inspection)
}

const makeTable = function(rw) {
  let table = `<tr><th>Item</th><th>Amount</th><th>Cost</th><th>Tax</th><th>Total</th></tr>`
  if (rw.gutterLength) {
    table += `<tr><td>Gutter</td><td>${rw.gutterLength} ft</td><td class="money">$${rw.gutterCost.toFixed(2)}</td><td class="money">$${rw.tax.toFixed(2)}</td><td class="money">$${rw.gutterTotal.toFixed(2)}</td></tr>`
  }
  if (rw.inspection) {
    table += `<tr><td>Inspection</td><td></td><td class="money">$${rw.inspectionCost.toFixed(2)}</td><td></td><td class="money">$${rw.inspectionCost.toFixed(2)}</td></tr>`
  }
  table += `<tr class="total-row"><td>Total</td><td></td><td class="money">$${rw.subtotal.toFixed(2)}</td><td class="money">$${rw.tax.toFixed(2)}</td><td class="money">$${rw.total.toFixed(2)}</td></tr>`
  return table
}

const clearForm = function() {
  $('#gutterFt').val('')
  $('#rw-inspection').prop('checked', false)
}

module.exports = {
  init: init,
  render: render,
  clearForm: clearForm
}
