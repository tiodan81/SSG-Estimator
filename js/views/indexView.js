var indexView = {}

indexView.init = function () {
  $('#home-content').show()
    .siblings().hide()
  // if (Object.keys(project.current).length) {
  //   indexView.render(project.current);
  // }
  indexView.handleCreateButton()
  indexView.handleSelector()
}

indexView.handleCreateButton = function() {
  $('#project-create-button').off('click').on('click', function(e) {
    e.preventDefault()
    $('#project-select-container').hide()
    $('#projectForm').show()
    indexView.handleProjectForm()
  })
}

indexView.handleProjectForm = function() {
  $('#projectForm').off('submit').on('submit', function(e) {
    e.preventDefault()
    let newProject = project.build()
    project.exists(newProject)
  })
}

indexView.render = function(project) {
  $('#projectForm').hide()
    .siblings().show()
  viewUtil.clearForm()
  indexView.populateSelector(project)
  $('#project-selector').val(project.client)
  $('#project-summary').html(indexView.makeTable(project))
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
  let html = ''
  html += `
  <h2>${cur.client}</h2>
  <table id="project-table">
  <tr><th>Item</th><th>Labor Hours</th><th>Labor Cost</th><th>Materials Cost</th><th>Subtotal</th><th>Tax</th><th>Total</th></tr>
  `
  if (cur.cisterns) {
    let cisterns = cur.cisterns.uberTank
    html += `<tr><td>Cisterns</td><td>${cisterns.totalHr}</td><td>${cisterns.laborTotal}</td><td>${cisterns.materialsTotal}</td><td>${cisterns.subtotal}</td><td>${cisterns.tax}</td><td>${cisterns.total}</td></tr>`
  }
  html +=`
  <tr><td>Mulch</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
  <tr><td>Total</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
  </table>
  `
  return html
}

indexView.updateProjectSummary = function() {

}
