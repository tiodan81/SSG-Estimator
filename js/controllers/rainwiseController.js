var rainwiseController = {}

rainwiseController.init = function() {
  rainwiseView.init()
}

rainwiseController.save = function() {
  let newRW = rainwise.build()
  rainwise.calcs(newRW)
  rainwise.saveToProject(newRW)
  rainwiseView.render(newRW)
}
