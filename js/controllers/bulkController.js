var bulkController = {}

bulkController.init = function() {
  bulkView.init()
}

bulkController.save = function() {
  let newBulk = bulk.build()
  bulk.calcs(newBulk)
  bulk.saveToProject(newBulk)
  bulkView.renderDetails(newBulk)
  bulkView.populateSelector(newBulk)
  $('#bulk-selector').val(newBulk.type)
}
