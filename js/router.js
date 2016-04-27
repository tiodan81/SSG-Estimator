const page = require('page')
const indexView = require('views/indexView')
const userController = require('controllers/userController')
const rainwiseController = require('controllers/rainwiseController')
const rgController = require('controllers/rgController')
const bulkController = require('controllers/bulkController')
const cisternController = require('controllers/cisternController')

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
