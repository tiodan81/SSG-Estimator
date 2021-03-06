var rg = {
  current: {}
}

rg.rgMaker = function(rg) {
  Object.keys(rg).forEach(function(e) {
    this[e] = rg[e]
  }, this)
}

rg.buildRG = () => {
  let inNum = +($('#rg-inflow-num').val())
  let outNum = +($('#rg-outflow-num').val())

  return new rg.rgMaker({
    id:           $('#rgID').val(),
    roof:         +($('#rg-roofArea').val()),
    infKnown:     $('#infiltKnown:checked').length ? true : false,
    infRate:      +($('#rgInfiltRate').val()),
    plantCost:    +($('#rgPlantBudget').val()),
    infNum:       inNum,
    infType1:     $('input[name=rgInflow1]:checked').val(),
    infVeg1:      $('#rgVegInflow1:checked').length ? true : false,
    infLen1:      +($('#rgInfLength1').val()),
    infType2:     inNum == 2 ? $('input[name=rgInflow2]:checked').val() : null,
    infVeg2:      inNum == 2 ? $('#rgVegInflow2:checked').length ? true : false : null,
    infLen2:      inNum == 2 ? +($('#rgInfLength2').val()): null,
    outNum:       outNum,
    outType1:     $('input[name=rgOutflow1]:checked').val(),
    outVeg1:      $('#rgVegOutflow1:checked').length ? true : false,
    outLen1:      +($('#rgOutLength1').val()),
    outType2:     outNum == 2 ? $('input[name=rgOutflow2]:checked').val() : null,
    outVeg2:      outNum == 2 ? $('#rgVegOutflow2:checked').length ? true : false : null,
    outLen2:      outNum == 2 ? +($('#rgOutLength2').val()) : null,
    fedByCistern: $('#fedByCistern:checked').length ? true : false,
    sodRmMethod:  $('input[name=rgSod]:checked').val(),
    dumpTruck:    $('#rgDumpTruck:checked').length ? true : false
  })
}

rg.getMultiplier = (c, rate = c.infRate) => {
  const nums = [
    [0.033, 0.074],
    [0.017, 0.046],
    [0.007, 0.028]
  ]
  let a
  let b = c.fedByCistern ? 0 : 1

  if (rate < 0.25) {
    alert('The infiltration rate is too low! No rain garden for you.')
    return
  } else if (rate < 0.5) {
    a = 0
  } else if (rate < 1) {
    a = 1
  } else {
    a = 2
  }

  return nums[a][b]
}

rg.allCalcs = (cur, mult) => {
  cur.area = rg.getArea(cur, mult)
  cur.baseMaterials = rg.baseMaterials(cur)
  cur.baseMaterialCost = rg.baseMaterialCost(cur)
  cur.truckCost = cur.dumpTruck ? materials.fees.dumpTruck : 0
  cur.cutterCost = cur.sodRmMethod === 'cutter' ? materials.fees.sodCutter : 0
  cur.plumbingMaterials = rg.plumbingMaterials(cur)
  cur.plumbingMaterialCost = rg.plumbingMaterialCost(cur)
  rg.laborHrs(cur)
  rg.laborCost(cur)
  cur.totals = rg.totals(cur)
  cur.materialSummary = rg.materialSummary(cur)
}

rg.getArea = (c, m) => {
  let area = Math.ceil(c.roof * m)

  return {
    baseArea:   area,
    footprint:  Math.ceil((4 * area + 2) * 0.8)
  }
}

rg.baseMaterials = (c) => {
  let a = c.area
  return {
    sodVolume:            util.round('ceil', a.footprint / 6 / 27, 0.5),
    bioretention:         util.round('ceil', a.baseArea / 27, 0.5),
    mulchVolume:          util.round('ceil', a.footprint / 4 / 27, 0.5)
  }
}

rg.baseMaterialCost = (c) => {
  let m = c.baseMaterials
  let bmc = {
    sodDumpCost:        rg.calcSodDumpCost(c, m),
    bioretentionCost:   util.round('round', m.bioretention * materials.bulk.bioretention, 0.01),
    mulchCost:          util.round('round', m.mulchVolume * materials.bulk.mulch, 0.01)
  }
  bmc.total = util.sumObject(bmc)
  return bmc
}

rg.calcSodDumpCost = (c, m) => {
  if (c.sodRmMethod === 'manual' || c.sodRmMethod === 'cutter') {
    return util.round('round', m.sodVolume * materials.fees.sodDump, 0.01)
  } else {
    return 0
  }
}

rg.plumbingMaterials = (c) => ({
  dispersionChannelMaterials:   c.roof < 1000 ? rg.channelMaterials(3) : rg.channelMaterials(6),
  inflow1Materials:             c.infType1 === 'channel' ? rg.channelMaterials(c.infLen1) : rg.pipeMaterials(c.infLen1, 'in'),
  inflow2Materials:             c.infNum === 2 ? c.infType2 === 'channel' ? rg.channelMaterials(c.infLen2) : rg.pipeMaterials(c.infLen2, 'in') : null,
  outflow1Materials:            c.outType1 === 'channel' ? rg.channelMaterials(c.outLen1) : rg.pipeMaterials(c.outLen1, 'out'),
  outflow2Materials:            c.outNum === 2 ? c.outType2 === 'channel' ? rg.channelMaterials(c.outLen2) : rg.pipeMaterials(c.outLen2, 'out') : null
})

rg.channelMaterials = (len) => {
  let area = Math.round(len * 2)

  return {
    pondliner:      area,
    bioretention:   len > 3 ? util.round('ceil', area / 3 / 27, 0.5) : 0.1,
    drainageRock:   len > 3 ? util.round('ceil', area / 3 / 27, 0.5) : 0.1
  }
}

rg.pipeMaterials = (len, inout) => {
  let type = inout === 'in' ? 'pvc3In' : 'pvc4In'
  let obj = {}
  obj[type] = len
  return obj
}

rg.plumbingMaterialCost = (c) => {
  let m = c.plumbingMaterials
  let pmc = {
    dispersionMaterialCost:   rg.channelMaterialCost(m.dispersionChannelMaterials),
    inflow1MaterialCost:      c.infType1 === 'channel' ? rg.channelMaterialCost(m.inflow1Materials, c.infVeg1) : rg.pipeMaterialCost(m.inflow1Materials),
    inflow2MaterialCost:      c.infNum === 2 ? c.infType2 === 'channel' ? rg.channelMaterialCost(m.inflow2Materials, c.infVeg2) : rg.pipeMaterialCost(m.inflow2Materials) : {total: 0},
    outflow1MaterialCost:     c.outType1 === 'channel' ? rg.channelMaterialCost(m.outflow1Materials, c.outVeg1) : rg.pipeMaterialCost(m.outflow1Materials),
    outflow2MaterialCost:     c.outNum === 2 ? c.outType2 === 'channel' ? rg.channelMaterialCost(m.outflow2Materials, c.outVeg2) : rg.pipeMaterialCost(m.outflow2Materials) : {total: 0}
  }
  pmc.total = util.round('round', pmc.dispersionMaterialCost.total + pmc.inflow1MaterialCost.total + pmc.inflow2MaterialCost.total + pmc.outflow1MaterialCost.total + pmc.outflow2MaterialCost.total ,0.01)
  return pmc
}

rg.channelMaterialCost = (m, veg) => {
  let cmc = {
    pondlinerCost:    util.round('round', util.materialCost(m.pondliner, materials.fabric.pondliner), 0.01),
    bioretentionCost: util.round('round', util.materialCost(m.bioretention, materials.bulk.bioretention), 0.01),
    drainageRockCost: util.round('round', util.materialCost(m.drainageRock, materials.bulk.drainageRock), 0.01),
    plantCost: veg ? util.round('round', util.materialCost(m.pondliner, materials.misc.rgChannelPlanting), 0.01) : 0
  }
  cmc.total = util.sumObject(cmc)
  return cmc
}

rg.pipeMaterialCost = (m) => {
  let key, type, cost
  if (m.hasOwnProperty('pvc3In')) {
    key = 'pvc3InCost'
    type = materials.plumbing.pvc3In
    cost = util.round('round', util.materialCost(type, m.pvc3In), 0.01)
  } else {
    key = 'pvc4InCost'
    type = materials.plumbing.pvc4In
    cost = util.round('round', util.materialCost(type, m.pvc4In), 0.01)
  }
  let obj = { total: cost }
  obj[key] = cost
  return obj
}

rg.laborHrs = (c) => {
  let m = c.plumbingMaterials

  c.baseHrs = rg.baseHrs(c)
  c.dispersionHrs = rg.channelHrs(m.dispersionChannelMaterials, 3, false)
  c.inflow1Hrs = c.infType1 === 'channel' ? rg.channelHrs(m.inflow1Materials, c.infLen1, c.infVeg1) : rg.pipeHrs(c.infLen1)
  c.inflow2Hrs = c.infNum === 2 ? c.infType2 === 'channel' ? rg.channelHrs(m.inflow2Materials, c.infLen2, c.infVeg2) : rg.pipeHrs(c.infLen2) : 0
  c.outflow1Hrs = c.outType1 === 'channel' ? rg.channelHrs(m.outflow1Materials, c.outLen1, c.outVeg1) : rg.pipeHrs(c.outLen1)
  c.outflow2Hrs = c.outNum === 2 ? c.outType2 === 'channel' ? rg.channelHrs(m.outflow2Materials, c.outLen2, c.outVeg2) : rg.pipeHrs(c.outLen2) : 0
}

rg.baseHrs = (c) => {
  let sodHrs = rg.sodHrs(c.sodRmMethod, c.area.footprint)
  let excavationHrs = util.round('ceil', (c.area.baseArea / 2) + 3, 0.5)
  let bioretenHrs = Math.round(2 * c.baseMaterials.bioretention + 1)
  let mulchHrs = Math.round(2 * c.baseMaterials.mulchVolume + 1)
  let plantingHrs = util.round('ceil', (c.area.footprint / 20) + 4, 0.5)

  return {
    sodHrs:         sodHrs,
    excavationHrs:  excavationHrs,
    bioretenHrs:    bioretenHrs,
    mulchHrs:       mulchHrs,
    plantingHrs:    plantingHrs,
    total:          util.round('ceil', sodHrs + excavationHrs + bioretenHrs + mulchHrs + plantingHrs, 0.25)
  }
}

rg.sodHrs = (method, footprint) => {
  if (method === 'cutter') {
    return util.round('ceil', footprint / 171, 0.5)
  } else if (method === 'manual') {
    return util.round('ceil', footprint / 60, 0.5)
  } else {
    return 0
  }
}

rg.channelHrs = (mat, len, veg) => {
  let excavationHrs = len / 4
  let bioretenHrs = mat.bioretention + 1
  let plantingHrs = veg ? len / 4 : 0
  let rockHrs = mat.drainageRock + 1

  return util.round('ceil', excavationHrs + bioretenHrs + plantingHrs + rockHrs, 0.5)
}

rg.pipeHrs = (len) => {
  return util.round('ceil', len / 4, 0.5)
}

rg.laborCost = (c) => {
  let inf2 = c.infNum === 2 ? c.inflow2Hrs : 0
  let out2 = c.outNum === 2 ? c.outflow2Hrs : 0

  c.baseLaborCost = rg.baseLaborCost(c.baseHrs)
  c.dispersionLaborCost = util.laborCost(c.dispersionHrs)
  c.inflow1LaborCost = util.laborCost(c.inflow1Hrs)
  c.inflow2LaborCost = inf2 != 0 ? util.laborCost(inf2) : 0
  c.outflow1LaborCost = util.laborCost(c.outflow1Hrs)
  c.outflow2LaborCost = out2 != 0 ? util.laborCost(out2) : 0
}

rg.baseLaborCost = (base) => {
  let blc = {
    sodLaborCost:           util.laborCost(base.sodHrs),
    excavationLaborCost:    util.laborCost(base.excavationHrs),
    bioretentionLaborCost:  util.laborCost(base.bioretenHrs),
    mulchLaborCost:         util.laborCost(base.mulchHrs),
    plantingLaborCost:      util.laborCost(base.plantingHrs)
  }
  blc.total = util.sumObject(blc)
  return blc
}

rg.totals = (c) => {
  let lc = c.laborCost
  let lh = c.laborHrs

  let materialsCost = util.round('round', c.baseMaterialCost.total + c.plumbingMaterialCost.total + c.plantCost + c.truckCost + c.cutterCost, 0.01)
  let laborCost = util.round('round', c.baseLaborCost.total + c.dispersionLaborCost + c.inflow1LaborCost + c.inflow2LaborCost + c.outflow1LaborCost + c.outflow2LaborCost, 0.01)
  let laborHrs = util.round('ceil', c.baseHrs.total + c.dispersionHrs + c.inflow1Hrs + c.inflow2Hrs + c.outflow1Hrs + c.outflow2Hrs, 0.5)
  let subtotal = util.round('round', materialsCost + laborCost, 0.01)
  let tax = util.round('round', util.salesTax(subtotal), 0.01)
  let total = util.round('round', subtotal + tax, 0.01)

  return {
    materialsCostTotal:   materialsCost,
    laborCostTotal:       laborCost,
    laborHrsTotal:        laborHrs,
    subtotal:             subtotal,
    tax:                  tax,
    total:                total
  }
}

rg.materialSummary = (c) => ({
  bio:          util.round('round', util.plucky('bioretention', c), 0.25),
  rock:         util.round('round', util.plucky('drainageRock', c), 0.25),
  pond:         util.round('round', util.plucky('pondliner', c), 1),
  bioCost:      util.round('round', util.plucky('bioretentionCost', c), 0.01),
  rockCost:     util.round('round', util.plucky('drainageRockCost', c), 0.01),
  pondCost:     util.round('round', util.plucky('pondlinerCost', c), 0.01),
  sodDumpCost:  c.baseMaterialCost.sodDumpCost,
  cutterCost:   c.cutterCost,
  truckCost:    c.truckCost,
  pvc3In:       util.round('round', util.plucky('pvc3In', c), 1),
  pvc4In:       util.round('round', util.plucky('pvc4In', c), 1),
  pvc3InCost:   util.round('round', util.plucky('pvc3InCost', c), 0.01),
  pvc4InCost:   util.round('round', util.plucky('pvc4InCost', c), 0.01),
  plantCost:    util.round('round', util.plucky('plantCost', c), 0.01)
})

rg.preventDuplicates = () => {
  let $id = $('#rgID').val()
  let $exists = util.findObjInArray($id, project.current.rainGardens.all, 'id').length
  if ($exists) {
    return true
  } else {
    return false
  }
}

rg.saveToProject = (newRG) => {
  if(user.uid && project.current.client) {
    rg.storeLocally(newRG)
    project.updateComponent(project.current, 'rainGardens')
  } else {
    alert('Either you\'re not signed in or haven\'t initiated a project!')
  }
}

rg.storeLocally = (newRG) => {
  let cur = project.current.rainGardens.all
  let $exists = util.findObjInArray(newRG.id, cur, 'id')
  if($exists.length) {
    cur.forEach((c,i) => {
      if(newRG.id === c.id) {
        cur[i] = newRG
      }
    })
  } else {
    cur.push(newRG)
  }
  rg.updateUberRG(newRG)
  rg.current = newRG
}

rg.updateUberRG = () => {
  let rgs = project.current.rainGardens
  let uber = rg.makeUberRG(rg.excludeLowEst(rgs.all))
  rgs.uber = uber
  if (rgs.all.length > 1) {
    rgView.populateSelector(uber)
  }
}

rg.excludeLowEst = (arr) => {
  const re = /(low estimate)/
  return arr.filter((e) => {
    return re.test(e.id) == false
  })
}

rg.makeUberRG = (all) => {

  const picked = util.objectStripper(all, ['totals', 'materialSummary', 'baseHrs', 'dispersionHrs', 'inflow1Hrs', 'inflow2Hrs', 'outflow1Hrs', 'outflow2Hrs', 'baseLaborCost', 'dispersionLaborCost', 'inflow1LaborCost', 'inflow2LaborCost', 'outflow1LaborCost', 'outflow2LaborCost', 'baseMaterials', 'baseMaterialCost'])
  let uber = rg.merger(picked)
  uber.id = 'All rain gardens'
  uber.dumpTruck = util.picker(all, 'dumpTruck').indexOf(true) >= 0 ? true : false
  uber.sodRmMethod = rg.getUberSodRmMethod(all)
  if (uber.dumpTruck) { uber.truckCost = materials.fees.dumpTruck }
  if (uber.sodRmMethod === 'cutter') { uber.cutterCost = materials.fees.sodCutter }
  if (uber.inflow2Hrs > 0) { uber.infNum = 2 }
  if (uber.outflow2Hrs > 0) { uber.outNum = 2 }
  return uber
}

rg.getUberSodRmMethod = function(arr) {
  let method = util.picker(arr, 'sodRmMethod')

  if (method.indexOf('cutter') >= 0) {
    return 'cutter'
  } else if (method.indexOf('manual') >= 0) {
    return 'manual'
  } else {
    return 'none'
  }
}

rg.merger = function(arr) {
  let merged = $.extend(true, {}, arr[0])

  for (let i = 1; i < arr.length; i++) {
    for (let prop in arr[i]) {
      if (typeof(merged[prop]) === 'number') {
        merged[prop] += arr[i][prop]
      } else if (Object.prototype.toString.call(merged[prop]) === '[object Object]') {
        for (let nestprop in merged[prop]) {
          if (typeof(merged[prop][nestprop]) === 'number') {
            merged[prop][nestprop] += arr[i][prop][nestprop]
          }
        }
      }
    }
  }
  return merged
}
