var firebase = new Firebase('https://ssgestimator.firebaseio.com/');
var projects = firebase.child('projects');
var users = firebase.child('users');


var user = {};
// {
//   'projects': {
//     'one': {
//       'name': 'p1',
//       'owners': {
//         'user1': true,
//         'user2': true
//       },
//       'mulches': {
//         'mulchZones': [{}, {}],
//         'volume': 10,
//         'price': 20
//       }
//     }
//   },
//   'users': {
//     'uid': 'user1',
//     'pwd': 'pwd1'
//     'projects': {
//       'p1': true,
//       'p2': true
//     }
//   }
// }


firebase.set({    //set JSON formatted object to FB; overwrites node and all children
  "key": "val"
}, function(error) {
  if (error) {
    //handle
  } else {
    console.log('success');
  }
});

firebase.update(); //update some keys at node

firebase.child('key').on('value', function(snapshot) {    //read. 'value' event fires once for initial state of data, also every time data changes
  console.log(snapshot.val());                            //gets a snapshot including all child data
}, function (errorObject) {
  console.log('Epic fail: ' + errorObject.code);
});

user.create = function(event) {
  event.preventDefault();
  user.email = $('#new-user').val();
  var userPassword = $('#new-password').val();
  firebase.createUser({
    email     : user.email,
    password  : userPassword
  }, function(error, userData) {
    if (error) {
      alert(error);
      console.log('error creating user: ', error);
    } else {
      console.log('Successfully created user account with uid: ', userData.uid);
      user.authenticate(userPassword);
    }
  });
};

user.authLogin = function() {

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
      //do we need uid here? do we get one?
      //load user's projects
    }
  });
};

$(function() {
  $('#new-user-form').submit(user.create);
  $('#login-form').submit(user.authenticate);
});
