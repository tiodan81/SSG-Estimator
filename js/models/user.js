const firebase = require('../firebase')
const fbProjects = firebase.child('projects')
const fbUsers = firebase.child('users')
const fbAdmins = firebase.child('admins')
const project = require('./project')
const indexView = require('../views/indexView')
const userController = require('../controllers/userController')

const create = function(email, pwd) {
  firebase.createUser({
    email     : email,
    password  : pwd
  }, function(error, userData) {
    if (error) {
      switch (error.code) {
      case "EMAIL_TAKEN":
        console.log('Cannot create user. Email ' + email + ' is already in use.')
        break
      case "INVALID_EMAIL":
        console.log('Invalid email.')
        break
      default:
        alert(error)
        console.log('error creating user: ', error)
      }
    } else {
      console.log(userData)
      console.log('Successfully created user account with uid: ', userData.uid)
      exports.email = email
      authenticate(pwd)
    }
  })
}

const authenticate = function(pwd) {
  firebase.authWithPassword({
    email     : exports.email,
    password  : pwd
  }, function(error, authData) {
    if (error) {
      console.log('Login failed', error)
      alert('Login failed. Please try again or create a new account.')
    } else {
      console.log('Authenticated successfully with payload: ', authData)
      exports.uid = authData.uid
      isAdmin(exports.uid).then((admin) => {
        if (admin) {
          getAllProjects()
        } else {
          getProjectList(exports.uid)
        }
      }, console.log)
    }
  })
}

const isLoggedIn = function() {
  return firebase.getAuth()
}

const logout = function() {
  return firebase.unauth()
}

const isAdmin = function(uid) {
  return fbAdmins.child(uid).once('value').then(function(s) {
    return s.val()
  })
}

const setProjectOwner = function(newProject) {
  let userRef = fbUsers.child(exports.uid)
  let obj = {}
  obj[newProject.client] = true
  if (userRef) {
    userRef.child('projects').update(obj)
  } else {
    userRef.child('projects').set(obj)
  }
}

const getProjectList = function(uid) {
  console.log('loading projects for user ' + uid)

  fbUsers.child(uid).child('projects').once('value').then(function(snapshot) {
    let loadingProjects = []

    snapshot.forEach(function(proj) {
      let curProj = proj.key()
      let loadProjPromise = fbProjects.child(curProj).once('value').then(function(snap) {
        project.allProjects.push(snap.val())
        indexView.populateSelector(snap.val())
      })
      loadingProjects.push(loadProjPromise)
    })

    return Promise.all(loadingProjects)
  })
  .then(userController.userInit())
}

const getAllProjects = function() {
  fbProjects.once('value').then(function(snap) {
    snap.forEach(function(proj) {
      project.allProjects.push(proj.val())
      indexView.populateSelector(proj.val())
    })
  })
  .then(userController.userInit())
}

module.exports = {
  email: '',
  uid: '',
  admin: false,
  projects: [],
  create: create,
  authenticate: authenticate,
  isLoggedIn: isLoggedIn,
  logout: logout,
  isAdmin: isAdmin,
  setProjectOwner: setProjectOwner,
  getProjectList: getProjectList,
  getAllProjects: getAllProjects
}
