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
  let html = ''
  html += `
  <h2>${cur.client}</h2>
  <table id="project-table">
  <tr><th>Item</th><th>Labor Hours</th><th>Labor Cost</th><th>Materials Cost</th><th>Subtotal</th><th>Tax</th><th>Total</th></tr>
  `
  if (cur.rainGardens.allRGs.length) {
    let rgs = cur.rainGardens.uberRG
    html += `<tr><td>Rain gardens</td><td>${rgs.totals.laborHrsTotal}</td><td>${rgs.totals.laborCostTotal}</td><td>${rgs.totals.materialsCostTotal}</td><td>${rgs.totals.subtotal}</td><td>${rgs.totals.tax}</td><td>${rgs.totals.total}</td></tr>`
  }
  if (cur.cisterns.allCisterns.length) {
    let cisterns = cur.cisterns.uberTank
    html += `<tr><td>Cisterns</td><td>${cisterns.totalHr}</td><td>${cisterns.laborTotal}</td><td>${cisterns.materialsTotal}</td><td>${cisterns.subtotal}</td><td>${cisterns.tax}</td><td>${cisterns.total}</td></tr>`
  }
  //<tr><td>Mulch</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
  html +=`
  <tr><td>Total</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
  </table>
  `
  return html
}

indexView.updateProjectSummary = function() {

}
