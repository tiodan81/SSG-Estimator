const $ = require('jquery')
const util = require('../util')
const user = require('./user')
const project = require('./project')
const materials = require('../../data/materials.json')

const rwMaker = function(rw) {
  Object.keys(rw).forEach((e) => {
    this[e] = rw[e]
  }, this)
}

const build = function() {
  return new rwMaker({
    gutterLength: +($('#gutterFt').val()) || 0,
    inspection:   $('#rw-inspection:checked').length ? true : false
  })
}

const calcs = function(rw) {
  rw.gutterCost = util.round('round', util.materialCost(rw.gutterLength, materials.plumbing.gutter), 0.01)
  rw.tax = util.salesTax(rw.gutterCost)
  rw.gutterTotal = util.round('round', rw.gutterCost + rw.tax, 0.01)
  rw.inspectionCost = rw.inspection ? materials.fees.rainwiseInspection : 0
  rw.subtotal = util.round('round', rw.gutterCost + rw.inspectionCost, 0.01)
  rw.total = util.round('round', rw.subtotal + rw.tax, 0.01)
}

const saveToProject = function(rw) {
  if (user.uid && project.current.client) {
    project.current.rainwise.uber = rw
    project.updateComponent(project.current, 'rainwise')
  } else {
    return new Error('Either you\'re not signed in or haven\'t initiated a project!')
  }
}

module.exports = {
  build: build,
  calcs: calcs,
  saveToProject: saveToProject
}
