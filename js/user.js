const firebase = new Firebase('https://ssgestimator.firebaseio.com/');
const fbProjects = firebase.child('projects');
const fbUsers = firebase.child('users');

var user = {
  email: '',
  uid: '',
  projects: []
};

user.create = function(email, pwd) {
  firebase.createUser({
    email     : email,
    password  : pwd
  }, function(error, userData) {
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

user.authenticate = function(pwd) {
  firebase.authWithPassword({
    email     : user.email,
    password  : pwd
  }, function(error, authData) {
    if (error) {
      console.log('Login failed', error);
      alert('Login failed. Please try again or create an account.');
    } else {
      console.log('Authenticated successfully with payload: ', authData);
      user.uid = authData.uid;
      user.getProjectList(user.email);
    }
  });
  indexView.init();
};

user.isLoggedIn = function() {
  return firebase.getAuth();
};

user.setProjectOwner = function(newProject) {
  let userRef = fbUsers.child(user.uid);
  let obj = {};
  obj[newProject.client] = true;
  let userString = JSON.stringify(obj);
  if (userRef) {
    userRef.child('projects').update(obj);
  } else {
    userRef.child('projects').set(obj);
  }
};

user.loadProject = function(projName) {
  fbProjects.child(projName).once('value', function(snapshot) {
    project.allProjects.push(snapshot.val());
  });
};

user.getProjectList = function(id) {
  console.log('loading projects for user ' + id);
  fbUsers.child(id).child('projects').once('value', function(snapshot) {
    snapshot.forEach(function(proj) {
      user.loadProject(proj.key());
    });
  });
};
