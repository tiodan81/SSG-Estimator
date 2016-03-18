const firebase = new Firebase('https://ssgestimator.firebaseio.com/')
const fbProjects = firebase.child('projects')
const fbUsers = firebase.child('users')

const nuke = function() {
  fbProjects.remove()
  fbUsers.remove()
  page('/')
}

var user = {
  email: '',
  uid: '',
  projects: []
}

user.create = function(email, pwd) {
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
      user.email = email
      user.authenticate(pwd)
    }
  })
}

user.authenticate = function(pwd) {
  firebase.authWithPassword({
    email     : user.email,
    password  : pwd
  }, function(error, authData) {
    if (error) {
      console.log('Login failed', error)
      alert('Login failed. Please try again or create an account.')
    } else {
      console.log('Authenticated successfully with payload: ', authData)
      user.uid = authData.uid
      user.getProjectList()
    }
  })
}

user.isLoggedIn = function() {
  return firebase.getAuth()
}

user.logout = function() {
  return firebase.unauth()
}

user.setProjectOwner = function(newProject) {
  let userRef = fbUsers.child(user.uid)
  let obj = {}
  obj[newProject.client] = true
  let userString = JSON.stringify(obj)
  if (userRef) {
    userRef.child('projects').update(obj)
  } else {
    userRef.child('projects').set(obj)
  }
}

user.getProjectList = function() {
  console.log('loading projects for user ' + user.uid)
  fbUsers.child(user.uid).child('projects').once('value').then(function(snapshot) {
    var loadingProjects = []

    snapshot.forEach(function(proj) {
      let curProj = proj.key()
      let loadProjPromise = fbProjects.child(curProj).once('value').then(function(snap) {
        project.allProjects.push(snap.val())
        indexView.populateSelector(snap.val())
      })
      loadingProjects.push(loadProjPromise)
    })

    return Promise.all(loadingProjects)
  }).then(function() {
    if (project.allProjects.length) {
      project.current = project.allProjects[0]
      project.populate(project.current)
    }
    project.getJSON()
    indexView.init()
    loginView.showLogoutNav()
  })
}
