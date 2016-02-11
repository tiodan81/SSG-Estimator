var controller = {};

controller.checkLogin = function() {
  if (user.uid) {
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
