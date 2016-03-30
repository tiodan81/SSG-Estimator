var rainwiseView = {}

rainwiseView.init = function() {
  $('#rainwise-content').show()
    .siblings().hide()
  rainwiseView.handleSave()
}

rainwiseView.handleSave = function() {
  $('#rainwiseForm').off('submit').on('submit', function(e) {
    e.preventDefault()
    let $val = $('#rainwise-save').val()
    console.log($val);
    if ($val === 'save') {
      rainwiseController.save()
      rainwiseView.clearForm()
    }
  })
}

rainwiseView.clearForm = function() {

}
