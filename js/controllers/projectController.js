var projectController = {}

projectController.create = function() {
  let newProject = project.build()

  project.exists(newProject)
  user.setProjectOwner(newProject)
  indexView.clearForm()
  indexView.populateSelector(newProject)
  $('#project-selector').val(newProject.client)
  $('#projectForm').hide()
    .siblings().show()
  indexView.render(newProject)
}
