'use strict';

var projectController = {};

projectController.create = function () {
  var newProject = project.build();

  project.exists(newProject);
  user.setProjectOwner(newProject);
  indexView.clearForm();
  indexView.clearDisplays();
  indexView.populateSelector(newProject);
  $('#project-selector').val(newProject.client);
  $('#projectForm').hide().siblings().show();
  indexView.render(newProject);
};