var project = {
  name: '',
  mulches: {
    mulchZones: [],
    totalVolume: 0,
    totalPrice: 0 
  }
};

project.saveName = function() {
  $('#projectForm').on('submit', function(e) {
    e.preventDefault();
    project.name = $('#projectName').val();
  });
};
