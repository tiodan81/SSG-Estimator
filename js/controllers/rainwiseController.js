var rainwiseController = {}

rainwiseController.init = function() {
  rainwiseView.init()
}

rainwiseController.save = function() {
  let newRW = rainwise.build()
  console.log(newRW);
  rainwise.calcs(newRW)
  rainwise.saveToProject(newRW)
}
