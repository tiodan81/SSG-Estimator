var project = {
  allProjects = []
};

project.maker = function(client, city, labor, mkup, owner) {
  this.client = client;
  this.city = city;
  this.laborRate = labor;
  this.markup = mkup;
  this.owner = owner;
  // {
  //   uid: t/f
  // },
  // mulch: {},
  // cisterns: {}
};

var materials = {};

project.build = function() {
  let client = $('#project-client').val();
  let city = $('#project-city').val();
  let labor = +($('#project-labor-rate').val());
  let markup = +('1.' + $('#project-markup-rate').val());
  let owner = user.uid;
  return new project.maker(client, city, labor, markup, owner);
};

project.saveName = function() {
  $('#projectForm').on('submit', function(e) {
    e.preventDefault();
    project.name = $('#projectName').val();
    //if (user.uid)                         //only allow save if user is a project owner
    project.mulch = mulch;
    project.save();
  });
};

project.save = function() {
  let projectString = JSON.stringify(project);
  fbProjects.set(
    projectString,
    function(error) {
      if (error) {
        console.log('Project failed to save.');
      } else {
        console.log('Project saved.');
      }
    }
  );
};

project.addOwner = function() {
  //if curUser is owner, allow to add other users as owners/viewers
};
