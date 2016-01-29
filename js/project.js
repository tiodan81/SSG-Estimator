var project = {
  name: '',
  markup: 1.35,
  laborRate: 45,
  owners: {
    //uid: t/f
  },
  mulch: {}
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

var indexView = {};

indexView.init = function () {
  $('#home-content').show()
  .siblings().hide();
};
