var controller = {}

controller.checkLogin = () => {
  let auth = user.isLoggedIn()
  if (auth) {
    user.uid = auth.uid
    user.getProjectList()
  } else {
    loginView.init()
  }
}

controller.loginInit = () => {
  loginView.init()
}

controller.logout = () => {
  user.logout()
  project.clear()
  viewUtil.clear(loginView.init)
}

controller.rainwiseInit = () => {
  rainwiseView.init()
}

var rgController = {}

rgController.init = () => {
  rgView.init()
}

rgController.makeNew = () => {
  let infKnown = $('#infiltKnown:checked').length ? true : false

  if (infKnown) {
    let newRG = rg.buildRG()
    let m = rg.getMultiplier(newRG)
    rg.allCalcs(newRG, m)
    console.log(newRG);
    rg.saveToProject(newRG)
    rgView.render(newRG)
  } else {
    let high = rg.buildRG()
    let mHigh = rg.getMultiplier(high, 1)
    let highRG = rg.allCalcs(high, mHigh)
    let low = rg.buildRG()
    let mLow = rg.getMultiplier(low, 0.25)
    let lowRG = rg.allCalcs(low, mLow)
    highRG.lowEstimate = lowRG
    rg.saveToProject(highRG)
    //allCalcs high & low. or something
  }
}

controller.mulchInit = () => {
  mulchView.init()
}

controller.cisternInit = () => {
  cisternView.init()
}

$(function() {
  controller.checkLogin()
})
