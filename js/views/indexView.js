var indexView = {}

indexView.init = function() {
  $('#home-content').show()
    .siblings().hide()
  if (project.current.client) {
    indexView.render(project.current)
  }
  indexView.handleCreateButton()
  indexView.handleSelector()
}

indexView.handleCreateButton = function() {
  $('#project-create-button').off('click').on('click', function(e) {
    e.preventDefault()
    $('#project-select-container').hide()
    $('#projectForm').show()
    indexView.handleProjectForm()
    indexView.handleProjectCancel()
  })
}

indexView.handleProjectForm = function() {
  $('#projectForm').off('submit').on('submit', function(e) {
    e.preventDefault()
    projectController.create()
  })
}

indexView.handleProjectCancel = function() {
  $('#project-cancel').off('click').on('click', function(e) {
    indexView.clearForm()
    $('#projectForm').hide()
      .siblings().show()
  })
}

indexView.render = function(project) {
  $('#project-summary').show().html(indexView.makeTable(project))
}

indexView.clearForm = function() {
  $('#project-client').val('')
  $('#project-city').val('Seattle')
  $('#project-labor-rate').val('45')
  $('#project-markup-rate').val('35')
}

indexView.populateSelector = function(project) {
  let client = project.client
  if($('#project-selector option[value="' + client + '"]').length === 0) {
    let option = '<option value="' + client + '">' + client + '</option>'
    $('#project-selector').append(option)
  }
}

indexView.handleSelector = function() {
  $('#project-selector').off('change').on('change', function() {
    let id = $(this).val()
    if (id === 'default') {
      $('#project-summary').empty()
      return
    } else {
      let curProject = util.findObjInArray(id, project.allProjects, 'client')
      project.current = curProject[0]
      project.populate(project.current)
      projectView.clearDisplays()
      indexView.render(project.current)
    }
  })
}

indexView.makeTable = function(cur) {
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
    totals.materialsCost += rw.subtotal
    totals.subtotal += rw.subtotal
    totals.tax += rw.tax
    totals.total += rw.total
    html += `<tr><td>Rainwise</td><td></td><td></td><td>$${rw.subtotal}</td><td>$${rw.subtotal}</td><td>$${rw.tax}</td><td>$${rw.total}</td></tr>`
  }

  if (cur.rainGardens.all.length) {
    let rgs = cur.rainGardens.uber.totals
    totals.laborHours += rgs.laborHrsTotal
    totals.laborCost += rgs.laborCostTotal
    totals.materialsCost += rgs.materialsCostTotal
    totals.subtotal += rgs.subtotal
    totals.tax += rgs.tax
    totals.total += rgs.total
    html += `<tr><td>Rain gardens</td><td>${rgs.laborHrsTotal}</td><td>$${rgs.laborCostTotal}</td><td>$${rgs.materialsCostTotal}</td><td>$${rgs.subtotal}</td><td>$${rgs.tax}</td><td>$${rgs.total}</td></tr>`
  }
  if (cur.cisterns.all.length) {
    let cisterns = cur.cisterns.uber
    totals.laborHours += cisterns.laborHrsTotal
    totals.laborCost += cisterns.laborCostTotal
    totals.materialsCost += cisterns.materialsCostTotal
    totals.subtotal += cisterns.subtotal
    totals.tax += cisterns.tax
    totals.total += cisterns.total
    html += `<tr><td>Cisterns</td><td>${cisterns.laborHrsTotal}</td><td>$${cisterns.laborCostTotal}</td><td>$${cisterns.materialsCostTotal}</td><td>$${cisterns.subtotal}</td><td>$${cisterns.tax}</td><td>$${cisterns.total}</td></tr>`
  }

  if (cur.bulkMaterials.all.length) {
    let bulkTotals = util.sumStrippedProps(cur.bulkMaterials.all, ['price', 'tax', 'total'])
    totals.materialsCost += bulkTotals[0]
    totals.subtotal += bulkTotals[0]
    totals.tax += bulkTotals[1]
    totals.total += bulkTotals[2]
    html += `<tr><td>Bulk materials</td><td></td><td></td><td>$${bulkTotals[0]}</td><td>$${bulkTotals[0]}</td><td>$${bulkTotals[1]}</td><td>$${bulkTotals[2]}</td></tr>`
  }

  for (let prop in totals) {
    totals[prop] = util.round('round', totals[prop], 0.01)
  }

  html +=`
  <tr class="total-row"><td>Total</td><td>${totals.laborHours} hrs</td><td>$${totals.laborCost}</td><td>$${totals.materialsCost}</td><td>$${totals.subtotal}</td><td>$${totals.tax}</td><td>$${totals.total}</td></tr>
  </table>
  `
  return html
}
