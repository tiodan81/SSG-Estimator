var viewUtil = {}

viewUtil.clear = function(callback) {
  $('#logout').hide()
  $('#login').show()
  $('#project-selector').html('<option value="default">Select a Project</option>')
  $('#project-summary').html('')
  //clear mulch table
  $('#cistern-selector').html('')
  $('#cistern-display').hide()
  viewUtil.clearForm()
  callback()
}
