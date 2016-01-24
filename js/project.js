var project = {
  name: '',
  owners: {
    //uid: t/f
  },
  mulch: {

  }
};

// const project = (name) => {
//   var state = {
//     name,
//     owner: 'dan'
//   }
//   return Object.assign(
//     {},
//     mulch
//   )
// })

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
      //handle
      } else {
        console.log('success');
      }
    }
  );
};

var indexView = {};

indexView.init = function () {
  $('#home-content').show()
  .siblings().hide();
};
