const $ = require('jquery')
const project = require('../models/project')
const cistern = require('../models/cistern')
const cisternController = require('../controllers/cisternController')

const init = function() {
  $('#cistern-content').show()
    .siblings().hide()
  displayExisting()
  handleSave()
  handleSelector()
  handleNav()
  handleEdit()
  handleDelete()
}

const displayExisting = function() {
  let existing = project.current.cisterns
  if (existing.all.length) {
    $('#cistern-selector').empty()
    existing.all.forEach(function(e) {
      populateSelector(e)
    })
    populateSelector(existing.uber)
    cistern.current = existing.all[0]
    render(cistern.current)
  } else {
    return
  }
}

const handleSave = function() {
  $('#cisternForm').off('submit').on('submit', function(e) {
    e.preventDefault()
    let $val = $('#cistern-save').val()
    if ($val === 'save') {
      let dupe = cistern.preventDuplicates()

      if (dupe) {
        alert('That id has already been used. Please choose a different id.')
        return false
      }

      cisternController.save()
      clearForm()
    } else if ($val === 'update') {
      cisternController.save()
      clearForm()
      $('#cistern-save').val('save')
    }
  })
}

const render = function(cur) {
  populateSelector(cur)
  $('#cistern-selector').val(cur.id)
  makeTables(cur)
  if ($('#cistern-display').css('display') === 'none') {
    $('#cistern-display').show()
  }
  showSummary()
  editButtons()
}

const populateSelector = function(cur) {
  let curId = cur.id
  if ($('#cistern-selector option[value="' + curId + '"]').length === 0) {
    let option = '<option value="' + curId + '">' + curId + '</option>'
    $('#cistern-selector').append(option)
  }
}

const showSummary = function() {
  let $selected = $('#cistern-nav .button-primary').attr('id')
  if ($selected != 'summary') {
    $('#cistern-nav > #summary').addClass('button-primary')
      .siblings().removeClass('button-primary')
    $('#cistern-table-summary').show()
      .siblings().hide()
  }
}

const handleSelector = function() {
  $('#cistern-selector').off('change').on('change', function() {
    let id = $('#cistern-selector').val()

    if (id === 'All tanks') {
      makeTables(project.current.cisterns.uber)
      $('#cistern-edit-buttons').hide()
    } else {
      let curCistern = util.findObjInArray(id, project.current.cisterns.all, 'id')
      makeTables(curCistern[0])
      cistern.current = curCistern[0]
      $('#cistern-edit-buttons').show()
    }

    showSummary()
  })
}

const handleNav = function() {
  $('#cistern-nav > button').off('click').on('click', function() {
    let $curNav = $('#cistern-nav > .button-primary').attr('id')
    let $nextNav = $(this).attr('id')
    $(this).addClass('button-primary')
      .siblings().removeClass('button-primary')
    if ($curNav != $nextNav) {
      let target = '#cistern-table-' + $nextNav
      $(target).show()
        .siblings().hide()
    } else {
      return
    }
  })
}

const editButtons = function() {
  $('#cistern-edit-buttons').show()
  handleEdit()
  handleDelete()
}

const handleEdit = function() {
  $('#cistern-edit-buttons .icon-pencil2').off('click').on('click', function(e) {
    populateForm(cistern.current)
    $('#cistern-save').val('update')
  })
}

const handleDelete = function() {
  $('#cistern-edit-buttons .icon-bin2').off('click').on('click', function(e) {
    let old = cistern.current
    let all = project.current.cisterns.all

    all.forEach(function(e, i) {
      if (e.id === old.id) {
        all.splice(i, 1)
      }
    })

    $('#cistern-selector > option[value="' + old.id + '"]').remove()
    cistern.updateUberTank()

    if (all.length) {
      cistern.current = all[0]
      $('#cistern-selector').val(cistern.current.id)
      makeTables(cistern.current)
      showSummary()
      editButtons()
    } else {
      cistern.current = {}
      project.current.cisterns = { all: [], uber: {} }
      $('#cistern-display').hide()
    }

    project.updateComponent(project.current, 'cisterns')
  })
}

const populateForm = function(cur) {
  $('#cisternID').val(cur.id)
  $('#cistern-roofArea').val(cur.roofArea)
  $('#cisternModel').val(cur.model)
  $('#cisternBase').val(cur.baseHeight)
  $('#gutterFt').val(cur.gutter)
  $('#cisternInflow').val(cur.inflow)
  $('#cisternOutflow').val(cur.outflow)
  $('#cisternAddLabor').val(cur.additionalLaborHr)
  $('#cistern-pump').prop('checked', cur.pump)
  $('#cistern-diverter').prop('checked', cur.diverter)
  $('#cistern-gauge').prop('checked', cur.gauge)
}

const clearForm = function() {
  $('#cisternForm input[type="text"]').val('')
  $('#cisternModel').val('B420')
  $('#cisternBase').val('1')
  $('#cisternForm input[type="number"]').val('')
  $('#cisternForm input[type="checkbox"]').prop('checked', false)
}

const makeTables = function(cur) {
  $('#cistern-table-summary').html(makeSummary(cur))
  $('#cistern-table-labor').html(makeLabor(cur))
  $('#cistern-table-materials').html(makeMaterials(cur))
}

const makeSummary = function(cur) {
  let summary = ''
  summary += `
  <tr><th>Item</th><th>Amount</th></tr>
  <tr><td>Model</td><td>${cur.model}</td></tr>
  <tr><td>Roof area</td><td>${cur.roofArea} ft²</td></tr>
  <tr><td>Labor hours</td><td>${cur.laborHrsTotal}</td></tr>
  <tr><td>Labor cost</td><td class="money">$${cur.laborCostTotal.toFixed(2)}</td></tr>
  <tr><td>Materials cost</td><td class="money">$${cur.materialsCostTotal.toFixed(2)}</td></tr>
  <tr><td>Tax</td><td class="money">$${cur.tax.toFixed(2)}</td></tr>
  <tr class="total-row"><td>Total</td><td class="money">$${cur.total.toFixed(2)}</td></tr>
  `
  return summary
}

const makeLabor = function(cur) {
  let labor = ''
  labor += `
  <tr><th>Item</th><th>Hours</th><th>Cost</th></tr>
  <tr><td>Base</td><td>${cur.baseLaborHr}</td><td class="money">$${cur.baseLaborCost.toFixed(2)}</td></tr>
  <tr><td>Inflow</td><td>${cur.inflowLaborHr}</td><td class="money">$${cur.inflowLaborCost.toFixed(2)}</td></tr>
  <tr><td>Outflow</td><td>${cur.outflowLaborHr}</td><td class="money">$${cur.outflowLaborCost.toFixed(2)}</td></tr>
  `
  if (cur.additionalLaborHr) {
    labor += `<tr><td>Additional</td><td>${cur.additionalLaborHr}</td><td class="money">$${cur.additionalLaborCost.toFixed(2)}</td></tr>`
  }
  labor += `<tr class="total-row"><td>Total</td><td>${cur.laborHrsTotal}</td><td class="money">$${cur.laborCostTotal.toFixed(2)}</td></tr>`
  return labor
}

const makeMaterials = function(cur) {
  let materials = ''
  materials += `
  <tr><th>Item</th><th>Qty</th><th>Cost</th></tr>
  <tr><td>Tank</td><td>1</td><td class="money">$${cur.salePrice.toFixed(2)}</td></tr>
  <tr><td>1/4" minus</td><td>${cur.quarterMinus} yd</td><td class="money">$${cur.quarterMinusCost.toFixed(2)}</td></tr>
  `
  if (cur.manorStones != 0) {
    materials += `<tr><td>Manor stones</td><td>${cur.manorStones}</td><td class="money">$${cur.manorStoneCost.toFixed(2)}</td></tr>`
  }
  if (cur.cinderBlocks != 0) {
    materials += `<tr><td>Cinder blocks</td><td>${cur.cinderBlocks}</td><td class="money">$${cur.cinderBlockCost.toFixed(2)}</td></tr>`
  }
  materials += `
  <tr><td>Inflow pipe</td><td>${cur.inflow} ft</td><td class="money">$${cur.inflowPipeCost.toFixed(2)}</td></tr>
  <tr><td>Inflow hardware</td><td>${cur.inflowHardware}</td><td class="money">$${cur.inflowHdwCost.toFixed(2)}</td></tr>
  <tr><td>Outflow pipe</td><td>${cur.outflow} ft</td><td class="money">$${cur.outflowPipeCost.toFixed(2)}</td></tr>
  <tr><td>Outflow hardware</td><td>${cur.outflowHardware}</td><td class="money">$${cur.outflowHdwCost.toFixed(2)}</td></tr>
  `
  if (cur.slimlineRestraints) {
    materials += `<tr><td>Slimline restraints</td><td>1</td><td class="money">$${cur.slimlineRestraints.toFixed(2)}</td></tr>`
  }
  if (cur.pump) {
    materials += `<tr><td>Pump</td><td>${cur.pump}</td><td class="money">$${cur.pumpCost.toFixed(2)}</td></tr>`
  }
  if (cur.diverter) {
    materials += `<tr><td>Diverter</td><td>${cur.diverter}</td><td class="money">$${cur.diverterCost.toFixed(2)}</td></tr>`
  }
  if (cur.gauge) {
    materials += `<tr><td>Gauge</td><td>${cur.gauge}</td><td class="money">$${cur.gaugeCost.toFixed(2)}</td></tr>`
  }
  if (cur.bulkheadKit) {
    materials += `<tr><td>Bulkhead kit</td><td>1</td><td class="money">$${cur.bulkheadKit.toFixed(2)}</td></tr>`
  }
  materials += `
  <tr><td>Low-flow kit</td><td>1</td><td class="money">$75.00</td></tr>
  <tr class="total-row"><td>Total</td><td></td><td class="money">$${cur.materialsCostTotal.toFixed(2)}</td></tr>
  `
  return materials
}

module.exports = {
  init: init,
  render: render,
  populateSelector: populateSelector
}
