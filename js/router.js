page(
  '/',
  controller.checkLogin
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
