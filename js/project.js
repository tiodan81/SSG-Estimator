var project = {
  name: '',
  owners: {
    //uid: t/f
  },
  mulch: {}
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
  });
};
