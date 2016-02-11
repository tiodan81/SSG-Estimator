var controller = {};

controller.checkLogin = function() {
  let authData = firebase.getAuth();
  if (authData) {
    indexView.init();
  } else {
    loginView.init();
  }
};

controller.mulchInit = function() {
  mulchView.init();
};

controller.cisternInit = function() {
  cistern.getJSON(cisternView.init);
};
