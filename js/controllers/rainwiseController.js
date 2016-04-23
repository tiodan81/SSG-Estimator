const $ = require('jquery')
const rainwise = require('../models/rainwise')
const rainwiseView = require('../views/rainwiseView')

const init = function() {
  rainwiseView.init()
}

const save = function() {
  let newRW = rainwise.build()
  rainwise.calcs(newRW)
  rainwise.saveToProject(newRW)
  rainwiseView.render(newRW)
  rainwiseView.clearForm()
  $('#rainwise-edit-buttons').show()
}

module.exports = {
  init: init,
  save: save
}
