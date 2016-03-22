var rgController = {}

rgController.init = () => {
  rgView.init()
}

rgController.save = () => {
  let $infKnown = $('#infiltKnown:checked').length ? true : false

  if ($infKnown) {
    let newRG = rg.buildRG()
    let m = rg.getMultiplier(newRG)
    rg.allCalcs(newRG, m)
    rg.saveToProject(newRG)
    rgView.render(newRG)
  } else {
    let high = rg.buildRG()
    let mHigh = rg.getMultiplier(high, 1)
    rg.allCalcs(high, mHigh)
    rg.saveToProject(high)

    let low = rg.buildRG()
    let mLow = rg.getMultiplier(low, 0.25)
    rg.allCalcs(low, mLow)
    low.id += ' - low estimate'
    rg.saveToProject(low)

    rgView.render(high)
    rgView.render(low)
  }
}
