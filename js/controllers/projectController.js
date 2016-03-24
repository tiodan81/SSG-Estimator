var projectController = {}

projectController.create = function() {
  let newProject = project.build()

  project.exists(newProject)
  user.setProjectOwner(newProject)
  indexView.clearForm()
  projectView.clearDisplays()
  indexView.populateSelector(newProject)
  $('#project-selector').val(newProject.client)
  $('#projectForm').hide()
    .siblings().show()
  indexView.render(newProject)
}
