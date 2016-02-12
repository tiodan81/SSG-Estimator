var controller = {};

controller.checkLogin = function() {
  let auth = firebase.getAuth();
  if (auth) {
    //load user projects
    indexView.init();
  } else {
    loginView.init();
  }
};

controller.loginInit = function() {
  user.isLoggedIn(loginView.init);
};

controller.mulchInit = function() {
  mulchView.init();
};

controller.cisternInit = function() {
  cistern.getJSON(cisternView.init);
};
