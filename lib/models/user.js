'use strict';

var firebase = new Firebase('https://ssgestimator.firebaseio.com/');
var fbProjects = firebase.child('projects');
var fbUsers = firebase.child('users');
var fbAdmins = firebase.child('admins');

var user = {
  email: '',
  uid: '',
  admin: false,
  projects: []
};

user.create = function (email, pwd) {
  firebase.createUser({
    email: email,
    password: pwd
  }, function (error, userData) {
    if (error) {
      switch (error.code) {
        case "EMAIL_TAKEN":
          console.log('Cannot create user. Email ' + email + ' is already in use.');
          break;
        case "INVALID_EMAIL":
          console.log('Invalid email.');
          break;
        default:
          alert(error);
          console.log('error creating user: ', error);
      }
    } else {
      console.log(userData);
      console.log('Successfully created user account with uid: ', userData.uid);
      user.email = email;
      user.authenticate(pwd);
    }
  });
};

user.authenticate = function (pwd) {
  firebase.authWithPassword({
    email: user.email,
    password: pwd
  }, function (error, authData) {
    if (error) {
      console.log('Login failed', error);
      alert('Login failed. Please try again or create a new account.');
    } else {
      console.log('Authenticated successfully with payload: ', authData);
      user.uid = authData.uid;
      user.isAdmin(user.uid).then(function (admin) {
        if (admin) {
          user.getAllProjects();
        } else {
          user.getProjectList(user.uid);
        }
      }, console.log);
    }
  });
};

user.isLoggedIn = function () {
  return firebase.getAuth();
};

user.logout = function () {
  return firebase.unauth();
};

user.isAdmin = function (uid) {
  return fbAdmins.child(uid).once('value').then(function (s) {
    return s.val();
  });
};

user.setProjectOwner = function (newProject) {
  var userRef = fbUsers.child(user.uid);
  var obj = {};
  obj[newProject.client] = true;
  if (userRef) {
    userRef.child('projects').update(obj);
  } else {
    userRef.child('projects').set(obj);
  }
};

user.getProjectList = function (uid) {
  console.log('loading projects for user ' + uid);

  fbUsers.child(uid).child('projects').once('value').then(function (snapshot) {
    var loadingProjects = [];

    snapshot.forEach(function (proj) {
      var curProj = proj.key();
      var loadProjPromise = fbProjects.child(curProj).once('value').then(function (snap) {
        project.allProjects.push(snap.val());
        indexView.populateSelector(snap.val());
      });
      loadingProjects.push(loadProjPromise);
    });

    return Promise.all(loadingProjects);
  }).then(userController.userInit());
};

user.getAllProjects = function () {
  fbProjects.once('value').then(function (snap) {
    snap.forEach(function (proj) {
      project.allProjects.push(proj.val());
      indexView.populateSelector(proj.val());
    });
  }).then(userController.userInit());
};
