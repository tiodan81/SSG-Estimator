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
    project.mulch = mulch;
    project.save();
  });
};

project.save = function() {
  firebase.set({    //set JSON formatted object to FB; overwrites node and all children
    "key": "val"
  }, function(error) {
    if (error) {
      //handle
    } else {
      console.log('success');
    }
  });

};

var indexView = {};

indexView.init = function () {
  $('#home-content').show()
  .siblings().hide();
};
