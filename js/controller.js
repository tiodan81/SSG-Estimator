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

controller.rgInit = () => {
  rgView.init()
}

controller.rgNew = () => {

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
