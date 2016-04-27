const $ = require('jquery')
const user = require('./models/user')
const loginView = require('./views/loginView')

const checkLogin = function() {
  let auth = user.isLoggedIn()

  if (auth) {
    user.uid = auth.uid
    user.isAdmin(user.uid).then((admin) => {
      if (admin) {
        user.getAllProjects()
      } else {
        user.getProjectList(user.uid)
      }
    }, console.log)
  } else {
    loginView.init()
  }
}

$(function() {
  checkLogin()
})
