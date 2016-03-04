var rainwiseView = {}

rainwiseView.init = function() {
  $('#rainwise-content').show()
    .siblings().hide()
  rainwiseView.handleSave()
}

rainwiseView.handleSave = function() {
  $('#rainwiseForm').off('submit').on('submit', function(e) {
    e.preventDefault()

  })
}
