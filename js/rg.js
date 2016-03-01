var rg = {
  allRGs: [],
  current: {}
}

rg.rgMaker = function(rg) {
  Object.keys(rg).forEach(function(e) {
    this[e] = rg[e]
  }, this)
}

rg.buildRG = function() {
  return new rg.rgMaker({
    id: $('#rgID').val(),
    roof: +($('#roofArea').val()),
    infKnown: $('#infiltKnown:checked').length ? true : false,
    infRate: +($('#rgInfiltRate').val()),
    plantCost: +($('#rgPlantBudget').val()),
    infType: $('input[name=rgInflow]:checked').val(),
    infVeg: $('#rgVegInflow:checked').length ? true : false,
    infLen: +($('#rgInfLength').val()),
    outType: $('input[name=rgOutflow]:checked').val(),
    outVeg: $('#rgVegOutflow:checked').length ? true : false,
    outLen: +($('#rgOutLength').val()),
    fedByCistern: $('#fedByCistern:checked').length ? true : false,
    sodRmMethod: $('input[name=rgSod]:checked').val(),
    dumpTruck: $('#rgDumpTruck:checked').length ? true : false
  })
}

rg.decider = (c) => {
  if (c.infKnown) {
    let m = rg.getMultiplier(c)
    rg.allCalcs(c, m)
    //calcs
  } else {
    let high = rg.getMultiplier(c, 1)
    let low = rg.getMultiplier(c, 0.25)
    //allCalcs high & low. or something
  }
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
    alert('Too low! No rain garden for you.')
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
  rg.getArea(cur, mult)
  rg.baseMaterials(cur)
  rg.baseMaterialCost(cur)
  rg.plumbingMaterials(cur)
  rg.plumbingMaterialCost(cur)
  cur.laborHrs = rg.laborHrs(cur)
  cur.laborCost = rg.laborCost(cur)
}

rg.getArea = (c, m) => {
  c.baseArea = Math.ceil(c.roof * m)
  c.footprint = Math.ceil((4 * c.baseArea + 2) * 0.8)
}

rg.baseMaterials = (c) => {
  c.sodVolume = util.round('ceil', c.footprint / 6 / 27, 0.5)
  c.bioretVolume = util.round('ceil', c.baseArea / 27, 0.5)
  c.mulchVolume = util.round('ceil', c.footprint / 4 / 27, 0.5)
}

rg.baseMaterialCost = (c) => {
  c.sodDumpCost = rg.calcSodDumpCost(c)
  c.bioretCost = util.round('round', c.bioretVolume * materials.bulk.bioretention, 0.01)
  c.mulchCost = util.round('round', c.mulchVolume * materials.bulk.mulch, 0.01)
  c.cutterCost = c.sodRmMethod === 'cutter' ? materials.fees.sodCutter : 0
  c.truckCost = c.dumpTruck ? materials.fees.dumpTruck : 0
  c.baseMaterialsTotal = rg.baseMaterialsTotal(c)
}

rg.baseMaterialsTotal = (c) => {
  return util.round('round', c.sodDumpCost + c.bioretCost + c.mulchCost + c.cutterCost + c.truckCost + c.plantCost, 0.01)
}

rg.calcSodDumpCost = (c) => {
  if (c.sodRmMethod === 'manual' || c.sodRmMethod === 'cutter') {
    return util.round('round', c.sodVolume * materials.fees.sodDump, 0.01)
  } else {
    return 0
  }
}

rg.plumbingMaterials = (c) => {
  c.dispersionChannelMaterials = c.roof < 1000 ? rg.channelMaterials(3) : rg.channelMaterials(6)
  c.inflowMaterials = c.infType === 'channel' ? rg.channelMaterials(c.infLen) : rg.pipeMaterials(c.infLen, 'in')
  c.outflowMaterials = c.outType === 'channel' ? rg.channelMaterials(c.outLen) : rg.pipeMaterials(c.outLen, 'out')
}

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
  c.dispersionMaterialCost = rg.channelMaterialCost(c.dispersionChannelMaterials)
  c.inflowMaterialCost = c.infType === 'channel' ? rg.channelMaterialCost(c.inflowMaterials, c.infVeg) : rg.pipeMaterialCost(c.inflowMaterials)
  c.outflowMaterialCost = c.outType === 'channel' ? rg.channelMaterialCost(c.outflowMaterials, c.outVeg) : rg.pipeMaterialCost(c.outflowMaterials)
}

rg.channelMaterialCost = (m, veg) => ({

  pondlinerCost:    util.round('round', util.materialCost(m.pondlinerArea, materials.fabric.pondliner), 0.01),
  bioretentionCost: util.round('round', util.materialCost(m.bioretention, materials.bulk.bioretention), 0.01),
  drainageRockCost: util.round('round', util.materialCost(m.drainageRock, materials.bulk.drainageRock), 0.01),
  channelPlantCost: veg ? util.round('round', util.materialCost(m.pondlinerArea, materials.misc.rgChannelPlanting), 0.01) : 0

})

rg.pipeMaterialCost = (m) => {
  let pipe = m.pipe === '3in' ? materials.plumbing.pvc3In : materials.plumbing.pvc4In

  return util.round('round', util.materialCost(pipe, m.length), 0.01)
}

rg.laborHrs = (c) => ({

  sodHrs:         rg.sodHrs(c.sodRmMethod, c.footprint),
  excavationHrs:  util.round('ceil', (c.baseArea / 2) + 3, 0.25),
  bioretenHrs:    Math.round(2 * c.bioretVolume + 1),
  mulchHrs:       Math.round(2 * c.mulchVolume + 1),
  plantingHrs:    util.round('ceil', (c.footprint / 20) + 4, 0.25),
  dispersionHrs:  rg.channelHrs(c.dispersionChannelMaterials, 3, false),
  inflowHrs:      c.infType === 'channel' ? rg.channelHrs(c.inflowMaterials, c.infLen, c.infVeg) : rg.pipeHrs(c.infLen),
  outflowHrs:     c.outType === 'channel' ? rg.channelHrs(c.outflowMaterials, c.outLen, c.outVeg) : rg.pipeHrs(c.outLen)

})

rg.sodHrs = (method, footprint) => {
  if (method === 'cutter') {
    return util.round('ceil', footprint / 171, 0.25)
  } else if (method === 'manual') {
    return util.round('ceil', footprint / 60, 0.25)
  } else {
    return 0
  }
}

rg.channelHrs = (mat, len, veg) => ({

  excavationHrs:  len / 4,
  bioretenHrs:    mat.bioretention + 1,
  plantingHrs:    veg ? len / 4 : 0,
  rockHrs:        mat.drainageRock + 1

})

rg.pipeHrs = (len) => len / 4

rg.laborCost = (c) => {
  let l = c.laborHrs

  return {
    sodLaborCost:           util.laborCost(l.sodHrs),
    excavationLaborCost:    util.laborCost(l.excavationHrs),
    bioretentionLaborCost:  util.laborCost(l.bioretenHrs),
    mulchLaborCost:         util.laborCost(l.mulchHrs),
    plantingLaborCost:      util.laborCost(l.plantingHrs),
    dispersionLaborCost:    typeof(l.dispersionHrs) === 'object' ? rg.channelLaborCost(l.dispersionHrs) : util.laborCost(l.dispersionHrs),
    inflowLaborCost:        typeof(l.inflowHrs) === 'object' ? rg.channelLaborCost(l.inflowHrs) : util.laborCost(l.inflowHrs),
    outflowLaborCost:       typeof(l.outflowHrs) === 'object' ? rg.channelLaborCost(l.outflowHrs) : util.laborCost(l.outflowHrs)
  }
}

rg.channelLaborCost = (channel) => ({

  excavationLaborCost:    util.laborCost(channel.excavationHrs),
  bioretentionLaborCost:  util.laborCost(channel.bioretenHrs),
  plantingLaborCost:      util.laborCost(channel.plantingHrs),
  rockLaborCost:          util.laborCost(channel.rockHrs)

})
