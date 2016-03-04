var rg = {
  current: {}
}

rg.rgMaker = function(rg) {
  Object.keys(rg).forEach(function(e) {
    this[e] = rg[e]
  }, this)
}

rg.buildRG = () => {
  return new rg.rgMaker({
    id:           $('#rgID').val(),
    roof:         +($('#roofArea').val()),
    infKnown:     $('#infiltKnown:checked').length ? true : false,
    infRate:      +($('#rgInfiltRate').val()),
    plantCost:    +($('#rgPlantBudget').val()),
    infType:      $('input[name=rgInflow]:checked').val(),
    infVeg:       $('#rgVegInflow:checked').length ? true : false,
    infLen:       +($('#rgInfLength').val()),
    outType:      $('input[name=rgOutflow]:checked').val(),
    outVeg:       $('#rgVegOutflow:checked').length ? true : false,
    outLen:       +($('#rgOutLength').val()),
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
  cur.plumbingMaterials = rg.plumbingMaterials(cur)
  cur.plumbingMaterialCost = rg.plumbingMaterialCost(cur)
  cur.laborHrs = rg.laborHrs(cur)
  cur.laborCost = rg.laborCost(cur)
  cur.totals = rg.totals(cur)
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
    bioretentionVolume:   util.round('ceil', a.baseArea / 27, 0.5),
    mulchVolume:          util.round('ceil', a.footprint / 4 / 27, 0.5)
  }
}

rg.baseMaterialCost = (c) => {
  let m = c.baseMaterials
  let bmc = {
    sodDumpCost:        rg.calcSodDumpCost(c, m),
    bioretentionCost:   util.round('round', m.bioretentionVolume * materials.bulk.bioretention, 0.01),
    mulchCost:          util.round('round', m.mulchVolume * materials.bulk.mulch, 0.01),
    cutterCost:         c.sodRmMethod === 'cutter' ? materials.fees.sodCutter : 0,
    truckCost:          c.dumpTruck ? materials.fees.dumpTruck : 0
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
  inflowMaterials:              c.infType === 'channel' ? rg.channelMaterials(c.infLen) : rg.pipeMaterials(c.infLen, 'in'),
  outflowMaterials:             c.outType === 'channel' ? rg.channelMaterials(c.outLen) : rg.pipeMaterials(c.outLen, 'out')
})

rg.channelMaterials = (len) => {
  let area = Math.round(len * 2)

  return {
    pondlinerArea:  area,
    bioretention:   len > 3 ? util.round('ceil', area / 3 / 27, 0.5) : 0.1,
    drainageRock:   len > 3 ? util.round('ceil', area / 3 / 27, 0.5) : 0.1
  }
}

rg.pipeMaterials = (len, inout) => ({
  pipe:   inout === 'in' ? '3in' : '4in',
  length: len
})

rg.plumbingMaterialCost = (c) => {
  console.log(c);
  let m = c.plumbingMaterials
  let pmc = {
    dispersionMaterialCost:   rg.channelMaterialCost(m.dispersionChannelMaterials),
    inflowMaterialCost:       c.infType === 'channel' ? rg.channelMaterialCost(m.inflowMaterials, c.infVeg) : rg.pipeMaterialCost(m.inflowMaterials),
    outflowMaterialCost:      c.outType === 'channel' ? rg.channelMaterialCost(m.outflowMaterials, c.outVeg) : rg.pipeMaterialCost(m.outflowMaterials)
  }
  pmc.total = util.round('round', pmc.dispersionMaterialCost.total + pmc.inflowMaterialCost.total + pmc.outflowMaterialCost.total ,0.01)
  return pmc
}

rg.channelMaterialCost = (m, veg) => {
  let cmc = {
    pondlinerCost:    util.round('round', util.materialCost(m.pondlinerArea, materials.fabric.pondliner), 0.01),
    bioretentionCost: util.round('round', util.materialCost(m.bioretention, materials.bulk.bioretention), 0.01),
    drainageRockCost: util.round('round', util.materialCost(m.drainageRock, materials.bulk.drainageRock), 0.01),
    channelPlantCost: veg ? util.round('round', util.materialCost(m.pondlinerArea, materials.misc.rgChannelPlanting), 0.01) : 0
  }
  cmc.total = util.sumObject(cmc)
  return cmc
}

rg.pipeMaterialCost = (m) => {
  let pipe = m.pipe === '3in' ? materials.plumbing.pvc3In : materials.plumbing.pvc4In
  let cost = util.round('round', util.materialCost(pipe, m.length), 0.01)
  return {
    pipeCost: cost,
    total:    cost
  }
}

rg.laborHrs = (c) => {
  let m = c.plumbingMaterials

  return {
    baseHrs:        rg.baseHrs(c),
    dispersionHrs:  rg.channelHrs(m.dispersionChannelMaterials, 3, false),
    inflowHrs:      c.infType === 'channel' ? rg.channelHrs(m.inflowMaterials, c.infLen, c.infVeg) : rg.pipeHrs(c.infLen),
    outflowHrs:     c.outType === 'channel' ? rg.channelHrs(m.outflowMaterials, c.outLen, c.outVeg) : rg.pipeHrs(c.outLen)
  }
}

rg.baseHrs = (c) => {
  let sodHrs = rg.sodHrs(c.sodRmMethod, c.area.footprint)
  let excavationHrs = util.round('ceil', (c.area.baseArea / 2) + 3, 0.25)
  let bioretenHrs = Math.round(2 * c.baseMaterials.bioretentionVolume + 1)
  let mulchHrs = Math.round(2 * c.baseMaterials.mulchVolume + 1)
  let plantingHrs = util.round('ceil', (c.area.footprint / 20) + 4, 0.25)

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
    return util.round('ceil', footprint / 171, 0.25)
  } else if (method === 'manual') {
    return util.round('ceil', footprint / 60, 0.25)
  } else {
    return 0
  }
}

rg.channelHrs = (mat, len, veg) => {
  let excavationHrs = len / 4
  let bioretenHrs = mat.bioretention + 1
  let plantingHrs = veg ? len / 4 : 0
  let rockHrs = mat.drainageRock + 1

  return {
    excavationHrs: excavationHrs,
    bioretenHrs: bioretenHrs,
    plantingHrs: plantingHrs,
    rockHrs: rockHrs,
    total: util.round('ceil', excavationHrs + bioretenHrs + plantingHrs + rockHrs, 0.25)
  }
}

rg.pipeHrs = (len) => ({
  pipeHrs:  len / 4,
  total:    len / 4
})

rg.laborCost = (c) => {
  let base = c.laborHrs.baseHrs
  let disp = c.laborHrs.dispersionHrs
  let inf = c.laborHrs.inflowHrs
  let out = c.laborHrs.outflowHrs

  let lc = {
    baseLaborCost:          rg.baseLaborCost(base),
    dispersionLaborCost:    rg.channelLaborCost(disp),
    inflowLaborCost:        Object.keys(inf).length === 5 ? rg.channelLaborCost(inf) : rg.pipeLaborCost(inf),
    outflowLaborCost:       Object.keys(out).length === 5 ? rg.channelLaborCost(out) : rg.pipeLaborCost(out)
  }
  return lc
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

rg.channelLaborCost = (channel) => {
  let clc = {
    excavationLaborCost:    util.laborCost(channel.excavationHrs),
    bioretentionLaborCost:  util.laborCost(channel.bioretenHrs),
    plantingLaborCost:      util.laborCost(channel.plantingHrs),
    rockLaborCost:          util.laborCost(channel.rockHrs)
  }
  clc.total = util.sumObject(clc)
  return clc
}

rg.pipeLaborCost = (pipe) => ({
  total:          util.laborCost(pipe.pipeHrs)
})

rg.totals = (c) => {
  let materials = util.round('round', c.baseMaterialCost.total + c.plumbingMaterialCost.total, 0.01)
  let laborCost = util.round('round', c.laborCost.baseLaborCost.total + c.laborCost.dispersionLaborCost.total + c.laborCost.inflowLaborCost.total + c.laborCost.outflowLaborCost.total, 0.01)
  let laborHrs = util.round('ceil', c.laborHrs.baseHrs.total + c.laborHrs.dispersionHrs.total + c.laborHrs.inflowHrs.total + c.laborHrs.outflowHrs.total, 0.25)
  let subtotal = util.round('round', materials + laborCost, 0.01)
  let tax = util.round('round', util.salesTax(subtotal), 0.01)
  let total = util.round('round', subtotal + tax, 0.01)

  return {
    materialsTotal:   materials,
    laborCostTotal:   laborCost,
    laborHrsTotal:    laborHrs,
    subtotal:         subtotal,
    tax:              tax,
    total:            total
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
  let cur = project.current.rainGardens
  cur.allRGs.push(newRG)
  //rg.updateUberRG(newRG)
  rg.current = newRG
}

rg.updateUberRG = (rg) => {

}
