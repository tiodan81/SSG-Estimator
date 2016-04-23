const cistern = require('../models/cistern')
const cisternView = require('../views/cisternView')

const init = function() {
  cisternView.init()
}

const save = function() {
  let newCistern = cistern.buildCistern()
  cistern.allCalcs(newCistern)
  cistern.saveToProject(newCistern)
  cisternView.render(newCistern)
}

module.exports = {
  init: init,
  save: save
}
