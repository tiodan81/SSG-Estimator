page(
  '/',
  indexView.init
);

page(
  '/login',
  controller.loginInit
);

page(
  '/logout',
  controller.logoutInit
);

page(
  '/mulch',
  controller.mulchInit
);

page(
  '/cisterns',
  controller.cisternInit
);

page.start();
