page(
  '/',
  indexView.init
);

page(
  '/login',
  controller.loginInit
);

page(
  '/rainwise',
  controller.rainwiseInit
);

page(
  '/rain-gardens',
  controller.rgInit
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
