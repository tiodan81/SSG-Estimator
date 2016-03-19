page(
  '/',
  indexView.init
)

page(
  '/login',
  userController.loginInit
)

page(
  '/rainwise',
  mulchController.init
)

page(
  '/rain-gardens',
  rgController.init
)

page(
  '/mulch',
  mulchController.init
)

page(
  '/cisterns',
  cisternController.init
)

page.start()
