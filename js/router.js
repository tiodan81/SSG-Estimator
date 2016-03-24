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
  rainwiseController.init
)

page(
  '/rain-gardens',
  rgController.init
)

page(
  '/bulk',
  bulkController.init
)

page(
  '/cisterns',
  cisternController.init
)

page.start()
