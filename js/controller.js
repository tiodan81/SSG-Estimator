var controller = {}

controller.checkLogin = () => {
  let auth = user.isLoggedIn()
  if (auth) {
    user.uid = auth.uid
    project.getJSON(user.getProjectList)
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

  if (c.infKnown) {
    let c = rg.buildRG()
    let m = rg.getMultiplier(c)
    rg.allCalcs(c, m)
    //calcs
  } else {
    let high = rg.getMultiplier(c, 1)
    let low = rg.getMultiplier(c, 0.25)
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
