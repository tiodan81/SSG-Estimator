const $ = require('jquery')
const util = require('../util')
const project = require('./project')
const cisternView = require('../views/cisternView')
const materials = require('../../data/materials.json')
const tankModels = require('../../data/cisternModels.json')

const cisternMaker = function(ci, r, m, h, inf, out, al, pump, div, gauge) {
  this.id = ci || ''
  this.roofArea = r || 0
  this.model = m || ''
  this.baseHeight = h || 0
  this.inflow = inf || 0
  this.outflow = out || 0
  this.additionalLaborHr = al || 0
  this.pump = pump || 0
  this.diverter = div || 0
  this.gauge = gauge || 0
  this.quarterMinus = 0
  this.stoneType = ''
  this.manorStones = 0
  this.cinderBlocks = 0
  this.slimlineRestraints = 0
  this.bulkheadKit = 0
  this.inflowHardware = 0
  this.outflowHardware = 0
  this.baseLaborHr = 0
  this.inflowLaborHr = 0
  this.outflowLaborHr = 0
  this.pumpLaborHr = 0
  this.diverterLaborHr = 0
  this.gaugeLaborHr = 0
  this.laborHrsTotal = 0
  this.baseLaborCost = 0
  this.inflowLaborCost = 0
  this.outflowLaborCost = 0
  this.pumpLaborCost = 0
  this.diverterLaborCost = 0
  this.gaugeLaborCost = 0
  this.additionalLaborCost = 0
  this.salePrice = 0
  this.quarterMinusCost = 0
  this.manorStoneCost = 0
  this.cinderBlockCost = 0
  this.inflowPipeCost = 0
  this.outflowPipeCost = 0
  this.inflowHdwCost = 0
  this.outflowHdwCost = 0
  this.baseMaterialsCost = 0
  this.inflowMaterialsCost = 0
  this.outflowMaterialsCost = 0
  this.pumpCost = 0
  this.diverterCost = 0
  this.gaugeCost = 0
  this.laborCostTotal = 0
  this.materialsCostTotal = 0
  this.subtotal = 0
  this.tax = 0
  this.total = 0
}

const buildCistern = function() {
  let $id =     $('#cisternID').val()
  let $roof =   +($('#cistern-roofArea').val())
  let $m =      $('#cisternModel').val()
  let $bh =     +($('#cisternBase').val())
  let $inf =    +($('#cisternInflow').val())
  let $out =    +($('#cisternOutflow').val())
  let $al =     +($('#cisternAddLabor').val()) || 0
  let $pump =   $('#cistern-pump:checked').length ? 1 : 0
  let $div =    $('#cistern-diverter:checked').length ? 1 : 0
  let $gauge =  $('#cistern-gauge:checked').length ? 1 : 0
  return new cisternMaker($id, $roof, $m, $bh, $inf, $out, $al, $pump, $div, $gauge)
}

const volumeCyl = function(d, h) {
  return (Math.PI * Math.pow((d / 24), 2) * ((h / 2) + 0.33)) / 27
}

const volumeRect = function(w, d, h) {
  return ((w * d / 144) * ((1/3) + ((2/3) * (3/5) * h))) / 27
}

const tankSalePrice = function (model, info) {
  if (model === 'B420' || model === 'B265' || model === 'B530') {
    return Math.ceil(info.purchasePrice + info.delivery)
  } else {
    return Math.ceil(info.purchasePrice * project.current.markup + info.delivery)
  }
}

const calcManorStones = function (d, h) {
  return Math.ceil(Math.PI * d / 16) * h
}

const calcCinderBlocks = function(l, h) {
  return Math.ceil(l / 16) * 3 * h
}

const calculateHardware = function(pipe) {
  return Math.ceil(pipe * 0.05)
}

const calculateBaseMaterials = function (c) {
  let modelInfo = tankModels[c.model]
  c.salePrice = tankSalePrice(c.model, modelInfo)
  if (modelInfo.slimline) {
    c.quarterMinus = util.round('ceil', volumeRect(modelInfo.width, modelInfo.depth, c.baseHeight), 0.5)
    c.stoneType = 'Cinder block'
    c.cinderBlocks = calcCinderBlocks(modelInfo.width, c.baseHeight)
    c.cinderBlockCost = util.round('round', (c.cinderBlocks * materials.stone[c.stoneType]), 0.01)
    c.slimlineRestraints = materials.plumbing.slimlineRestraints
  } else {
    c.quarterMinus = util.round('ceil', volumeCyl(modelInfo.diameter, c.baseHeight), 0.5)
    c.stoneType = 'Manor stone'
    c.manorStones = calcManorStones(modelInfo.diameter, c.baseHeight)
    c.manorStoneCost = util.round('round', (c.manorStones * materials.stone[c.stoneType]), 0.01)
    c.slimlineRestraints = 0
  }
  c.bulkheadKit = c.model.charAt(0) === 'P' ? materials.plumbing.bulkheadKit : 0
  c.quarterMinusCost = util.round('round', (c.quarterMinus * materials.bulk.quarterMinus), 0.01)
  c.baseMaterialsCost = util.round('round', c.quarterMinusCost + c.cinderBlockCost + c.manorStoneCost + c.slimlineRestraints + c.bulkheadKit, 0.01)
}

const calculatePlumbingMaterials = function(c) {
  let pipeType = c.roof
  c.inflowPipeCost = util.round('round', util.materialCost(c.inflow, materials.plumbing.pvc3In), 0.01)
  c.outflowPipeCost = util.round('round', util.materialCost(c.outflow, materials.plumbing.pvc3In), 0.01)
  c.inflowHardware = calculateHardware(c.inflow)
  c.outflowHardware = calculateHardware(c.outflow)
  c.inflowHdwCost = util.round('round', util.materialCost(c.inflowHardware, materials.plumbing.hardware), 0.01)
  c.outflowHdwCost = util.round('round', util.materialCost(c.outflowHardware, materials.plumbing.hardware), 0.01)
  c.pumpCost = c.pump ? materials.plumbing.cisternPump : 0
  c.diverterCost = c.diverter ? materials.plumbing.firstFlushDiverter : 0
  c.gaugeCost = c.gauge ? materials.plumbing.cisternGauge : 0

  c.inflowMaterialsCost = util.round('round', c.inflowPipeCost + c.inflowHdwCost, 0.01)
  c.outflowMaterialsCost = util.round('round', c.outflowPipeCost + c.outflowHdwCost + materials.plumbing.lowFlowKit, 0.01)
}

const calculateLabor = function (c) {
  c.baseLaborHr = calcBaseLabor(c)
  c.pumpLaborHr = c.pump ? 6.5 : 0
  c.diverterLaborHr = c.diverter ? 2 : 0
  c.gaugeLaborHr = c.gauge ? 2 : 0
  c.inflowLaborHr = util.round('ceil', (c.inflow / 2) + c.diverterLaborHr, 0.5)
  c.outflowLaborHr = util.round('ceil', (c.outflow / 4) + c.pumpLaborHr + c.gaugeLaborHr, 0.5)
  c.laborHrsTotal = c.baseLaborHr + c.inflowLaborHr + c.outflowLaborHr + c.additionalLaborHr
  c.pumpLaborCost = util.laborCost(c.pumpLaborHr)
  c.diverterLaborCost = util.laborCost(c.diverterLaborHr)
  c.gaugeLaborCost = util.laborCost(c.gaugeLaborHr)
  c.baseLaborCost = util.laborCost(c.baseLaborHr)
  c.inflowLaborCost = util.laborCost(c.inflowLaborHr)
  c.outflowLaborCost = util.laborCost(c.outflowLaborHr)
  c.additionalLaborCost = util.laborCost(c.additionalLaborHr)
}

const calcBaseLabor = function(c) {
  let labor
  if (c.baseHeight === 0) {
    labor = 4 + Math.ceil((c.quarterMinus + c.manorStones + c.cinderBlocks) / 3)
  } else {
    labor = 10 + Math.ceil((c.quarterMinus + c.manorStones + c.cinderBlocks) / 3)
  }
  if (c.model === 'B420' || c.model === 'B265' || c.model === 'B530') {
    labor += 2
  }
  return labor
}

const calculateMaterialsCostTotal = function(c) {
  return util.round('round', c.salePrice + c.baseMaterialsCost + c.inflowMaterialsCost + c.outflowMaterialsCost, 0.01)
}

const calculateLaborCostTotal = function(c) {
  return util.round('round', c.baseLaborCost + c.inflowLaborCost + c.outflowLaborCost + c.additionalLaborCost, 0.01)
}

const calcSubTotal = function(c) {
  return util.round('round', c.laborCostTotal + c.materialsCostTotal, 0.01)
}

const calculateTotals = function(c) {
  c.materialsCostTotal = calculateMaterialsCostTotal(c)
  c.laborCostTotal = calculateLaborCostTotal(c)
  c.subtotal = c.materialsCostTotal + c.laborCostTotal
  c.tax = util.salesTax(c.subtotal)
  c.total = util.round('round', c.subtotal + c.tax, 0.01)
}

const allCalcs = function(cur) {
  calculateBaseMaterials(cur)
  calculatePlumbingMaterials(cur)
  calculateLabor(cur)
  calculateTotals(cur)
}

const preventDuplicates = function() {
  let $id = $('#cisternID').val()
  let exists = util.findObjInArray($id, project.current.cisterns.all, 'id').length
  if (exists) {
    return true
  } else {
    return false
  }
}

const saveToProject = function(newCistern) {
  if(user.uid && project.current.client) {
    storeLocally(newCistern)
    project.updateComponent(project.current, 'cisterns')
  } else {
    console.log('Either you\'re not signed in or haven\'t initiated a project!')
  }
}

const storeLocally = function(newCistern) {
  let cur = project.current.cisterns.all
  let exists = util.findObjInArray(newCistern.id, cur, 'id')

  if (exists.length) {
    cur.forEach((c,i) => {
      if (newCistern.id === c.id) {
        cur[i] = newCistern
      }
    })
  } else {
    cur.push(newCistern)
  }

  updateUberTank(newCistern)
  exports.current = newCistern
}


const updateUberTank = function() {
  const cisterns = project.current.cisterns
  const uber = makeUberTank(cisterns.all)
  cisterns.uber = uber
  if (cisterns.all.length > 1) {
    cisternView.populateSelector(uber)
  }
}

const makeUberTank = function(arr) {
  let obj = new cisternMaker()

  arr.forEach(function(e) {
    Object.keys(e).forEach(function(prop) {
      if (typeof(e[prop]) === 'number') {
        obj[prop] += e[prop]
      } else if (typeof(e[prop]) === 'string') {
        obj[prop] += e[prop] + ' '
      }
    }, obj)
  })
  obj.id = 'All tanks'
  return obj
}

module.exports = {
  current: {},
  buildCistern: buildCistern,
  allCalcs: allCalcs,
  saveToProject: saveToProject,
  preventDuplicates: preventDuplicates,
  updateUberTank: updateUberTank
}
