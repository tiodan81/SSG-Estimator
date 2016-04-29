const $ = require('jquery')
const project = require('../models/project')
const user = require('../models/user')
const indexView = require('../views/indexView')

const create = function() {
  console.log(project);
  let newProject = project.build()

  project.exists(newProject)
  user.setProjectOwner(newProject)
  indexView.clearForm()
  indexView.clearDisplays()
  indexView.populateSelector(newProject)
  $('#project-selector').val(newProject.client)
  $('#projectForm').hide()
    .siblings().show()
  indexView.render(newProject)
}

module.exports = {
  create: create
}
