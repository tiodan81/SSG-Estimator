var projectController = {}

projectController.create = function() {
  let newProject = project.build()

  project.exists(newProject)
  user.setProjectOwner(newProject)
  project.allProjects.push(newProject)
  project.current = newProject
  indexView.clearHideForm(newProject)
  indexView.populateSelector(newProject)
  indexView.render(newProject)
}
