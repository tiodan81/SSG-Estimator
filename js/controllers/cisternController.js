var cisternController = {}

cisternController.init = function() {
  cisternView.init()
}

cisternController.save = function() {
  let newCistern = cistern.buildCistern()
  cistern.allCalcs(newCistern)
  cistern.saveToProject(newCistern)
  cisternView.render(newCistern)
}
