var bulkController = {}

bulkController.init = function() {
  bulkView.init()
}

bulkController.save = function() {
  let newBulk = bulk.build()
  bulk.calcs(newBulk)
  bulk.saveToProject(newBulk)
  bulkView.renderDetails(newBulk.type)
  $('#bulk-nav > button:last-child').addClass('button-primary')
    .siblings().removeClass('button-primary')
  bulkView.handleNav()
  bulkView.populateSelector(newBulk)
  $('#bulk-selector').val(newBulk.type)
}
