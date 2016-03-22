var indexView = {}

indexView.init = function () {
  $('#home-content').show()
    .siblings().hide()
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
    viewUtil.clearForm()
    $('#projectForm').hide()
      .siblings().show()
  })
}

indexView.clearHideForm = function(newProject) {
  viewUtil.clearForm()
  $('#projectForm').hide()
  $('#project-selector').val(newProject.client)
}

indexView.render = function(project) {
  $('#project-summary').show().html(indexView.makeTable(project))
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
      indexView.render(project.current)
    }
  })
}

indexView.makeTable = function(cur) {
  console.log(cur);
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

  if (cur.rainGardens.all.length) {
    let rgs = cur.rainGardens.uber.totals
    totals.laborHours += rgs.laborHrsTotal
    totals.laborCost += rgs.laborCostTotal
    totals.materialsCost += rgs.laborCostTotal
    totals.subtotal += rgs.subtotal
    totals.tax += rgs.tax
    totals.total += rgs.total
    html += `<tr><td>Rain gardens</td><td>${rgs.laborHrsTotal}</td><td>${rgs.laborCostTotal}</td><td>${rgs.materialsCostTotal}</td><td>${rgs.subtotal}</td><td>${rgs.tax}</td><td>${rgs.total}</td></tr>`
  }
  if (cur.cisterns.all.length) {
    let cisterns = cur.cisterns.uber
    totals.laborHours += cisterns.laborHrsTotal
    totals.laborCost += cisterns.laborCostTotal
    totals.materialsCost += cisterns.laborCostTotal
    totals.subtotal += cisterns.subtotal
    totals.tax += cisterns.tax
    totals.total += cisterns.total
    html += `<tr><td>Cisterns</td><td>${cisterns.laborHrsTotal}</td><td>${cisterns.laborCostTotal}</td><td>${cisterns.materialsCostTotal}</td><td>${cisterns.subtotal}</td><td>${cisterns.tax}</td><td>${cisterns.total}</td></tr>`
  }
  //<tr><td>Mulch</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
  html +=`
  <tr><td>Total</td><td>${totals.laborHours}</td><td>${totals.laborCost}</td><td>${totals.materialsCost}</td><td>${totals.subtotal}</td><td>${totals.tax}</td><td>${totals.total}</td></tr>
  </table>
  `
  return html
}
