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

$(function() {
  userController.checkLogin()
})
