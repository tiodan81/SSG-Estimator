const $ = require('jquery')
const project = require('../models/project')
const bulk = require('../models/bulk')
const bulkView = require('../views/bulkView')
const util = require('../util')


const init = function() {
  bulkView.init()
}

const save = function() {
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

const remove = function(curId, curType) {
  let all = project.current.bulkMaterials.all

  all.forEach((bm, i) => {
    if (bm.id === curId) {
      all.splice(i, 1)
    }
  })

  if (all.length) {

    if (util.picker(all, 'type').indexOf(curType) === -1) {
      let firstRemainingType = all[0].type
      $('#bulk-selector > option[value="' + curType + '"]').remove()
      $('#bulk-selector').val(firstRemainingType)
      bulkView.renderDetails(firstRemainingType)
    } else {
      bulkView.renderDetails(curType)
    }

  } else {
    project.current.bulkMaterials = { all: [], uber: {} }
    $('#bulk-display').hide()
  }

  project.current.bulkMaterials.uber = bulk.makeUber(all)
  project.updateComponent(project.current, 'bulkMaterials')

}

module.exports = {
  init: init,
  save: save,
  remove: remove
}
