var rg = {
  allRGs: [],
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

rg.makeNew = () => {
  let c = rg.buildRG()

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
  return {
    sodDumpCost:        rg.calcSodDumpCost(c, m),
    bioretentionCost:   util.round('round', m.bioretentionVolume * materials.bulk.bioretention, 0.01),
    mulchCost:          util.round('round', m.mulchVolume * materials.bulk.mulch, 0.01),
    cutterCost:         c.sodRmMethod === 'cutter' ? materials.fees.sodCutter : 0,
    truckCost:          c.dumpTruck ? materials.fees.dumpTruck : 0
  }
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
  return {
    dispersionMaterialCost:   rg.channelMaterialCost(m.dispersionChannelMaterials),
    inflowMaterialCost:       c.infType === 'channel' ? rg.channelMaterialCost(m.inflowMaterials, c.infVeg) : rg.pipeMaterialCost(m.inflowMaterials),
    outflowMaterialCost:      c.outType === 'channel' ? rg.channelMaterialCost(m.outflowMaterials, c.outVeg) : rg.pipeMaterialCost(m.outflowMaterials)
  }
}

rg.channelMaterialCost = (m, veg) => ({
  pondlinerCost:    util.round('round', util.materialCost(m.pondlinerArea, materials.fabric.pondliner), 0.01),
  bioretentionCost: util.round('round', util.materialCost(m.bioretention, materials.bulk.bioretention), 0.01),
  drainageRockCost: util.round('round', util.materialCost(m.drainageRock, materials.bulk.drainageRock), 0.01),
  channelPlantCost: veg ? util.round('round', util.materialCost(m.pondlinerArea, materials.misc.rgChannelPlanting), 0.01) : 0
})

rg.pipeMaterialCost = (m) => {
  let pipe = m.pipe === '3in' ? materials.plumbing.pvc3In : materials.plumbing.pvc4In

  return {
    pipeCost: util.round('round', util.materialCost(pipe, m.length), 0.01)
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

rg.baseHrs = (c) => ({
  sodHrs:         rg.sodHrs(c.sodRmMethod, c.area.footprint),
  excavationHrs:  util.round('ceil', (c.area.baseArea / 2) + 3, 0.25),
  bioretenHrs:    Math.round(2 * c.baseMaterials.bioretentionVolume + 1),
  mulchHrs:       Math.round(2 * c.baseMaterials.mulchVolume + 1),
  plantingHrs:    util.round('ceil', (c.area.footprint / 20) + 4, 0.25),
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

rg.pipeHrs = (len) => ({
  pipeHrs: len / 4
})

rg.laborCost = (c) => {
  let base = c.laborHrs.baseHrs
  let disp = c.laborHrs.dispersionHrs
  let inf = c.laborHrs.inflowHrs
  let out = c.laborHrs.outflowHrs

  return {
    baseLaborCost:          rg.baseLaborCost(base),
    dispersionLaborCost:    rg.channelLaborCost(disp),
    inflowLaborCost:        Object.keys(inf).length === 4 ? rg.channelLaborCost(inf) : util.laborCost(inf.pipeHrs),
    outflowLaborCost:       Object.keys(out).length === 4 ? rg.channelLaborCost(out) : util.laborCost(out.pipeHrs)
  }
}

rg.baseLaborCost = (base) => ({
  sodLaborCost:           util.laborCost(base.sodHrs),
  excavationLaborCost:    util.laborCost(base.excavationHrs),
  bioretentionLaborCost:  util.laborCost(base.bioretenHrs),
  mulchLaborCost:         util.laborCost(base.mulchHrs),
  plantingLaborCost:      util.laborCost(base.plantingHrs)
})

rg.channelLaborCost = (channel) => ({
  excavationLaborCost:    util.laborCost(channel.excavationHrs),
  bioretentionLaborCost:  util.laborCost(channel.bioretenHrs),
  plantingLaborCost:      util.laborCost(channel.plantingHrs),
  rockLaborCost:          util.laborCost(channel.rockHrs)
})

rg.materialsTotal = () => {
  base
  dispersion
  inflow
  outflow
}

rg.baseMaterialsTotal = (c) => {
  return util.round('round', c.sodDumpCost + c.bioretentionCost + c.mulchCost + c.cutterCost + c.truckCost + c.plantCost, 0.01)
}

rg.laborTotal = () => {
  base
}
