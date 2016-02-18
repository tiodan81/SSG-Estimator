var controller = {};

controller.checkLogin = function() {
  let auth = user.isLoggedIn();
  if (auth) {
    user.uid = auth.uid;
    user.getProjectList(user.uid);
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
