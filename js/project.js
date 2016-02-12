var project = {
  name: '',
  city: '',
  laborRate: 45,
  markup: 1.35,
  owners: {
    //uid: t/f
  },
  mulch: {},
  cisterns: {}
};

var materials = {};

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
