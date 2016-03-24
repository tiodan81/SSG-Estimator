var userController = {}

userController.checkLogin = function() {
  let auth = user.isLoggedIn()
  if (auth) {
    user.uid = auth.uid
    user.getProjectList()
  } else {
    loginView.init()
  }
}

userController.loginInit = function() {
  loginView.init()
}

userController.logout = function() {
  user.logout()
  project.clear()
  $('#logout').hide()
  $('#login').show()
  $('#project-selector').html('<option value="default">Select a Project</option>')
  $('#project-summary').html('')
  projectView.clearDisplays()
  loginView.init()
}

userController.userInit = function() {
  project.getJSON()
  indexView.init()
  $('#project-selector').val('default')
  loginView.showLogoutNav()
}


$(function() {
  userController.checkLogin()
})
