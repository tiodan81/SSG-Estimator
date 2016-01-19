var firebase = new Firebase('https://ssgestimator.firebaseio.com/');
var projects = firebase.child('projects');
var users = firebase.child('users');

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
//       },
//
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

firebase.update() //update some keys at node

firebase.child('key').on('value', function(snapshot) {    //read. 'value' event fires once for initial state of data, also every time data changes
  console.log(snapshot.val());                            //gets a snapshot including all child data
}, function (errorObject) {
  console.log('Epic fail: ' + errorObject.code);
});

firebase.createUser({
  email     : 'user@user.com',
  password  : 'testing'
}, function(error, userData) {
  if (error) {
    console.log('error creating user: ', error);
  } else {
    console.log('Successfully created user account with uid: ', userData.uid);
  }
});
