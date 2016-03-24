var projectView = {}

projectView.clearDisplays = function() {
  $('#project-summary').html('')
  //rainwise
  $('#rg-selector').html('')
  $('#rg-tables table').html('')
  $('#rg-display').hide()
  //mulch
  $('#cistern-selector').html('')
  $('#cistern-tables table').html('')
  $('#cistern-display').hide()
}
