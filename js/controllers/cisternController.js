var cisternController = {}

cisternController.init = () => {
  cisternView.init()
}

cisternController.save = () => {
  let newCistern = cistern.buildCistern()
  cistern.allCalcs(newCistern)
  cistern.saveToProject(newCistern)
  cisternView.render(newCistern)  
}
