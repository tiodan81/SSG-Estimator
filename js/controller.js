var controller = {};

controller.checkLogin = function() {
  let auth = user.isLoggedIn();
  if (auth) {
    user.uid = auth.uid;
    user.getProjectList();
  } else {
    loginView.init();
  }
};

controller.loginInit = function() {
  loginView.init();
};

controller.logout = function() {
  user.logout();
  project.clear();
  viewUtil.clear(loginView.init);
};

controller.mulchInit = function() {
  mulchView.init();
};

controller.cisternInit = function() {
  cistern.getJSON(cisternView.init);
};
