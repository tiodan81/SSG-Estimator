const $ = require('jquery')
const project = require('../models/project')
const projectController = require('../controllers/projectController')
const util = require('../util')

const init = function() {
  $('#home-content').show()
    .siblings().hide()
  if (project.current.client) {
    render(project.current)
  }
  handleCreateButton()
  handleSelector()
}

const handleCreateButton = function() {
  $('#project-create-button').off('click').on('click', function(e) {
    e.preventDefault()
    $('#project-select-container').hide()
    $('#projectForm').show()
    handleProjectForm()
    handleProjectCancel()
  })
}

const handleProjectForm = function() {
  $('#projectForm').off('submit').on('submit', function(e) {
    e.preventDefault()
    projectController.create()
  })
}

const handleProjectCancel = function() {
  $('#project-cancel').off('click').on('click', function(e) {
    clearForm()
    $('#projectForm').hide()
      .siblings().show()
  })
}

const render = function(project) {
  $('#project-summary').show().html(makeTable(project))
}

const clearForm = function() {
  $('#project-client').val('')
  $('#project-city').val('Seattle')
  $('#project-labor-rate').val('45')
  $('#project-markup-rate').val('35')
}

const populateSelector = function(project) {
  let client = project.client
  if($('#project-selector option[value="' + client + '"]').length === 0) {
    let option = '<option value="' + client + '">' + client + '</option>'
    $('#project-selector').append(option)
  }
}

const handleSelector = function() {
  $('#project-selector').off('change').on('change', function() {
    let id = $(this).val()
    if (id === 'default') {
      $('#project-summary').empty()
      return
    } else {
      let curProject = util.findObjInArray(id, project.allProjects, 'client')
      project.current = curProject[0]
      project.populate(project.current)
      clearDisplays()
      render(project.current)
    }
  })
}

const makeTable = function(cur) {
  let html = `
    <h2>${cur.client}</h2>
    <table id="project-table">
    <tr><th>Item</th><th>Labor Hours</th><th>Labor Cost</th><th>Materials Cost</th><th>Subtotal</th><th>Tax</th><th>Total</th></tr>
  `

  let totals = {
    laborHours: 0,
    laborCost: 0,
    materialsCost: 0,
    subtotal: 0,
    tax: 0,
    total: 0
  }

  if (Object.keys(cur.rainwise.uber).length) {
    let rw = cur.rainwise.uber
    let disp = [rw.subtotal, rw.tax, rw.total].map((e) => e.toFixed(2))

    totals.materialsCost += rw.subtotal
    totals.subtotal += rw.subtotal
    totals.tax += rw.tax
    totals.total += rw.total

    html += `<tr><td>Rainwise</td><td></td><td></td><td class="money">$${disp[0]}</td><td class="money">$${disp[0]}</td><td class="money">$${disp[1]}</td><td class="money">$${disp[2]}</td></tr>`
  }

  if (cur.rainGardens.all.length) {
    let rgs = cur.rainGardens.uber.totals
    let disp = [rgs.laborCostTotal, rgs.materialsCostTotal, rgs.subtotal, rgs.tax, rgs.total].map((e) => e.toFixed(2))

    totals.laborHours += rgs.laborHrsTotal
    totals.laborCost += rgs.laborCostTotal
    totals.materialsCost += rgs.materialsCostTotal
    totals.subtotal += rgs.subtotal
    totals.tax += rgs.tax
    totals.total += rgs.total
    html += `<tr><td>Rain gardens</td><td>${rgs.laborHrsTotal}</td><td class="money">$${disp[0]}</td><td class="money">$${disp[1]}</td><td class="money">$${disp[2]}</td><td class="money">$${disp[3]}</td><td class="money">$${disp[4]}</td></tr>`
  }
  if (cur.cisterns.all.length) {
    let cisterns = cur.cisterns.uber
    let disp = [cisterns.laborCostTotal, cisterns.materialsCostTotal, cisterns.subtotal, cisterns.tax, cisterns.total].map((e) => e.toFixed(2))

    totals.laborHours += cisterns.laborHrsTotal
    totals.laborCost += cisterns.laborCostTotal
    totals.materialsCost += cisterns.materialsCostTotal
    totals.subtotal += cisterns.subtotal
    totals.tax += cisterns.tax
    totals.total += cisterns.total
    html += `<tr><td>Cisterns</td><td>${cisterns.laborHrsTotal}</td><td class="money">$${disp[0]}</td><td class="money">$${disp[1]}</td><td class="money">$${disp[2]}</td><td class="money">$${disp[3]}</td><td class="money">$${disp[4]}</td></tr>`
  }

  if (cur.bulkMaterials.all.length) {
    let uber = cur.bulkMaterials.uber
    let hours = util.round('ceil', util.plucky('hours', project.current.bulkMaterials.uber), 0.5)
    let laborCost = util.round('round', util.plucky('laborCost', project.current.bulkMaterials.uber), 0.01)
    let materialCost = util.round('round', util.plucky('materialCost', project.current.bulkMaterials.uber), 0.01)
    let subtotal = util.round('round', util.plucky('subtotal', project.current.bulkMaterials.uber), 0.01)
    let tax = util.round('round', util.plucky('tax', project.current.bulkMaterials.uber), 0.01)
    let total = util.round('round', util.plucky('total', project.current.bulkMaterials.uber), 0.01)

    totals.laborHours += hours
    totals.laborCost += laborCost
    totals.materialsCost += materialCost
    totals.subtotal += subtotal
    totals.tax += tax
    totals.total += total
    html += `
    <tr>
    <td>Bulk materials</td>
    <td>${hours}</td>
    <td class="money">$${laborCost.toFixed(2)}</td>
    <td class="money">$${materialCost.toFixed(2)}</td>
    <td class="money">$${subtotal.toFixed(2)}</td>
    <td class="money">$${tax.toFixed(2)}</td>
    <td class="money">$${total.toFixed(2)}</td>
    </tr>`
  }

  for (let prop in totals) {
    if (prop !== 'laborHours') {
      totals[prop] = totals[prop].toFixed(2)
    }
  }

  html +=`
  <tr class="total-row"><td>Total</td><td>${totals.laborHours} hrs</td><td class="money">$${totals.laborCost}</td><td class="money">$${totals.materialsCost}</td><td class="money">$${totals.subtotal}</td><td class="money">$${totals.tax}</td><td class="money">$${totals.total}</td></tr>
  </table>
  `
  return html
}

const clearDisplays = function() {
  $('#project-summary').html('')
  $('#rainwise-table').html('')
  $('#rg-selector').html('')
  $('#rg-tables table').html('')
  $('#rg-display').hide()
  $('#bulk-selector').html('')
  $('#bulk-table').html('')
  $('#bulk-display').hide()
  $('#cistern-selector').html('')
  $('#cistern-tables table').html('')
  $('#cistern-display').hide()
}

module.exports = {
  init: init,
  render: render,
  clearForm: clearForm,
  clearDisplays: clearDisplays,
  populateSelector: populateSelector
}
