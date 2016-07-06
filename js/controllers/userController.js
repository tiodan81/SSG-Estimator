var userController = {}

userController.checkLogin = function() {
  let auth = user.isLoggedIn()

  if (auth) {
    user.setUserID(auth.uid)
    user.isAdmin(auth.uid).then((admin) => {
      if (admin) {
        user.getAllProjects()
      } else {
        user.getProjectList(auth.uid)
      }
    }, console.log)
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
  indexView.clearDisplays()
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
