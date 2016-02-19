page(
  '/',
  indexView.init
);

page(
  '/login',
  controller.loginInit
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
