const $ = require('jquery')
const user = require('../models/user')
const indexView = require('../views/indexView')
const loginView = require('../views/loginView')
const project = require('../models/project')

// const checkLogin = function() {
//   let auth = user.isLoggedIn()
//
//   if (auth) {
//     user.uid = auth.uid
//     user.isAdmin(user.uid).then((admin) => {
//       if (admin) {
//         user.getAllProjects()
//       } else {
//         user.getProjectList(user.uid)
//       }
//     }, console.log)
//   } else {
//     loginView.init()
//   }
// }

const loginInit = function() {
  loginView.init()
}

const logout = function() {
  user.logout()
  project.clear()
  $('#logout').hide()
  $('#login').show()
  $('#project-selector').html('<option value="default">Select a Project</option>')
  $('#project-summary').html('')
  indexView.clearDisplays()
  loginView.init()
}

const userInit = function() {
  indexView.init()
  $('#project-selector').val('default')
  loginView.showLogoutNav()
}

module.exports = {
  userInit: userInit,
  loginInit: loginInit,
  logout: logout
}
