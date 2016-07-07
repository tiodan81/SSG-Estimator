const firebase = new Firebase('https://ssgestimator.firebaseio.com/')
const fbProjects = firebase.child('projects')
const fbUsers = firebase.child('users')
const fbAdmins = firebase.child('admins')

var user = {
  email: '',
  uid: '',
  admin: false,
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
      user.authenticate(email, pwd)
    }
  })
}

user.authenticate = function(email, pwd) {
  firebase.authWithPassword({
    email     : email,
    password  : pwd
  }, function(error, authData) {
    if (error) {
      console.log('Login failed', error)
      alert('Login failed. Please try again or create a new account.')
    } else {
      console.log('Authenticated successfully with payload: ', authData)
      user.email = email
      user.setUserID(authData.uid)
      user.isAdmin(user.uid).then((admin) => {
        if (admin) {
          user.getAllProjects()
        } else {
          user.getProjectList(user.uid)
        }
      }, console.log)
    }
  })
}

user.isLoggedIn = function() {
  return firebase.getAuth()
}

user.logout = function() {
  return firebase.unauth()
}

user.setUserID = function(id) {
  return user.uid = id
}

user.isAdmin = function(uid) {
  return fbAdmins.child(uid).once('value').then(function(s) {
    return s.val()
  })
}

user.setProjectOwner = function(newProject) {
  let userRef = fbUsers.child(user.uid)
  let obj = {}
  obj[newProject.client] = true
  if (userRef) {
    userRef.child('projects').update(obj)
  } else {
    userRef.child('projects').set(obj)
  }
}

user.getProjectList = function(uid) {
  console.log('loading projects for user ' + uid)

  fbUsers.child(uid).child('projects').once('value').then(function(snapshot) {
    let loadingProjects = []

    snapshot.forEach(function(proj) {
      let curProj = proj.key()
      let loadProjPromise = fbProjects.child(curProj).once('value').then(function(snap) {
        project.addProject(snap.val())
        indexView.populateSelector(snap.val())
      })
      loadingProjects.push(loadProjPromise)
    })

    return Promise.all(loadingProjects)
  })
  .then(userController.userInit())
}

user.getAllProjects = function() {
  fbProjects.once('value').then(function(snap) {
    snap.forEach(function(proj) {
      project.addProject(proj.val())
      indexView.populateSelector(proj.val())
    })
  })
  .then(userController.userInit())
}
