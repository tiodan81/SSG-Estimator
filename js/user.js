const firebase = new Firebase('https://ssgestimator.firebaseio.com/');
const fbProjects = firebase.child('projects');
const fbUsers = firebase.child('users');

var user = {
  email: '',
  uid: '',
  projects: []
};


//firebase.update(); //update some keys at node

// firebase.child('key').on('value', function(snapshot) {    //read. 'value' event fires once for initial state of data, also every time data changes
//   console.log(snapshot.val());                            //gets a snapshot including all child data
// }, function (errorObject) {
//   console.log('Epic fail: ' + errorObject.code);
// });

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
      user.loadProjects(user.email);
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

user.loadProjects = function(id) {
  console.log('loading projects for user ' + id);
  //user.projects =
};
