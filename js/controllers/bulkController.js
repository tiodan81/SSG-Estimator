var bulkController = {}

bulkController.init = function() {
  bulkView.init()
}

bulkController.save = function() {
  let newBulk = bulk.build()
  bulk.calcs(newBulk)
  bulk.saveToProject(newBulk)
  bulkView.renderDetails(newBulk)
  // bulkView.makeTable()
  // bulk.updateTotals()
  // bulkView.showTotal()
  // bulkView.editZone()
  // bulkView.deleteZone()
}
