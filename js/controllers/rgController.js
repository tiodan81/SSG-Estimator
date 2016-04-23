const $ = require('jquery')
const rg = require('../models/rg')
const rgView = require('../views/rgView')

const init = function() {
  rgView.init()
}

const save = function() {
  let $infKnown = $('#infiltKnown:checked').length ? true : false

  if ($infKnown) {
    let newRG = rg.buildRG()
    let m = rg.getMultiplier(newRG)
    rg.allCalcs(newRG, m)
    rg.saveToProject(newRG)
    rgView.render(newRG)
  } else {
    let low = rg.buildRG()
    let mLow = rg.getMultiplier(low, 0.25)
    let high = rg.buildRG()
    let mHigh = rg.getMultiplier(high, 1)

    rg.allCalcs(low, mLow)
    low.id += ' - low estimate'
    rg.saveToProject(low)

    rg.allCalcs(high, mHigh)
    rg.saveToProject(high)

    rgView.render(low)
    rgView.render(high)
  }
}

module.exports = {
  init: init,
  save: save
}
