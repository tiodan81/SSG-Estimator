var project = {
  name: ''
};

project.saveName = function() {
  $('#projectForm').on('submit', function(e) {
    e.preventDefault();
    project.name = $('#projectName').val();
  });
};
