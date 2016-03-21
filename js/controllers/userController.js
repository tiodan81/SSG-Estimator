var userController = {}

userController.checkLogin = () => {
  let auth = user.isLoggedIn()
  if (auth) {
    user.uid = auth.uid
    user.getProjectList()
  } else {
    loginView.init()
  }
}

userController.loginInit = () => {
  loginView.init()
}

userController.logout = () => {
  user.logout()
  project.clear()
  viewUtil.clear(loginView.init)
}

userController.userInit = () => {
  project.getJSON()
  indexView.init()
  $('#project-selector').val('default')
  loginView.showLogoutNav()
}


$(function() {
  userController.checkLogin()
})
