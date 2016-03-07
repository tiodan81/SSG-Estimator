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
    infNum:       +($('#rg-inflow-num').val()),
    infType1:     $('input[name=rgInflow1]:checked').val(),
    infVeg1:      $('#rgVegInflow1:checked').length ? true : false,
    infLen1:      +($('#rgInfLength1').val()),
    infType2:     $('input[name=rgInflow2]:checked').val(),
    infVeg2:      $('#rgVegInflow2:checked').length ? true : false,
    infLen2:      +($('#rgInfLength2').val()),
    outNum:       +($('#rg-outflow-num').val()),
    outType1:     $('input[name=rgOutflow1]:checked').val(),
    outVeg1:      $('#rgVegOutflow1:checked').length ? true : false,
    outLen1:      +($('#rgOutLength1').val()),
    outType2:     $('input[name=rgOutflow2]:checked').val(),
    outVeg2:      $('#rgVegOutflow2:checked').length ? true : false,
    outLen2:      +($('#rgOutLength2').val()),
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
  inflow1Materials:             c.infType1 === 'channel' ? rg.channelMaterials(c.infLen1) : rg.pipeMaterials(c.infLen1, 'in'),
  inflow2Materials:             c.infNum === 2 ? c.infType2 === 'channel' ? rg.channelMaterials(c.infLen2) : rg.pipeMaterials(c.infLen2, 'in') : null,
  outflow1Materials:            c.outType1 === 'channel' ? rg.channelMaterials(c.outLen1) : rg.pipeMaterials(c.outLen1, 'out'),
  outflow2Materials:            c.outNum === 2 ? c.outType2 === 'channel' ? rg.channelMaterials(c.outLen2) : rg.pipeMaterials(c.outLen2, 'in') : null
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
  let m = c.plumbingMaterials
  let pmc = {
    dispersionMaterialCost:   rg.channelMaterialCost(m.dispersionChannelMaterials),
    inflow1MaterialCost:      c.infType1 === 'channel' ? rg.channelMaterialCost(m.inflow1Materials, c.infVeg1) : rg.pipeMaterialCost(m.inflow1Materials),
    inflow2MaterialCost:      c.infNum === 2 ? c.infType2 === 'channel' ? rg.channelMaterialCost(m.inflow2Materials, c.infVeg2) : rg.pipeMaterialCost(m.inflow2Materials) : 0,
    outflow1MaterialCost:     c.outType1 === 'channel' ? rg.channelMaterialCost(m.outflow1Materials, c.outVeg1) : rg.pipeMaterialCost(m.outflow1Materials),
    outflow2MaterialCost:     c.outNum === 2 ? c.outType2 === 'channel' ? rg.channelMaterialCost(m.outflow2Materials, c.outVeg2) : rg.pipeMaterialCost(m.outflow2Materials) : 0
  }
  pmc.total = util.round('round', pmc.dispersionMaterialCost.total + pmc.inflow1MaterialCost.total + pmc.inflow2MaterialCost.total + pmc.outflow1MaterialCost.total + pmc.outflow2MaterialCost.total ,0.01)
  console.log(pmc);
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
    inflow1Hrs:     c.infType1 === 'channel' ? rg.channelHrs(m.inflow1Materials, c.infLen1, c.infVeg1) : rg.pipeHrs(c.infLen1),
    inflow2Hrs:     c.infNum === 2 ? c.infType2 === 'channel' ? rg.channelHrs(m.inflow2Materials, c.infLen2, c.infVeg2) : rg.pipeHrs(c.infLen2) : 0,
    outflow1Hrs:    c.outType1 === 'channel' ? rg.channelHrs(m.outflow1Materials, c.outLen1, c.outVeg1) : rg.pipeHrs(c.outLen1),
    outflow2Hrs:    c.outNum === 2 ? c.outType2 === 'channel' ? rg.channelHrs(m.outflow2Materials, c.outLen2, c.outVeg2) : rg.pipeHrs(c.outLen2) : 0
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
    excavationHrs:  excavationHrs,
    bioretenHrs:    bioretenHrs,
    plantingHrs:    plantingHrs,
    rockHrs:        rockHrs,
    total:          util.round('ceil', excavationHrs + bioretenHrs + plantingHrs + rockHrs, 0.25)
  }
}

rg.pipeHrs = (len) => ({
  pipeHrs:  len / 4,
  total:    len / 4
})

rg.laborCost = (c) => {
  let base = c.laborHrs.baseHrs
  let disp = c.laborHrs.dispersionHrs
  let inf1 = c.laborHrs.inflow1Hrs
  let inf2 = c.infNum === 2 ? c.laborHrs.inflow2Hrs : 0
  let out1 = c.laborHrs.outflow1Hrs
  let out2 = c.outNum === 2 ? c.laborHrs.outflow2Hrs : 0

  let lc = {
    baseLaborCost:          rg.baseLaborCost(base),
    dispersionLaborCost:    rg.channelLaborCost(disp),
    inflow1LaborCost:       c.infType1 === 'channel' ? rg.channelLaborCost(inf1) : rg.pipeLaborCost(inf1),
    inflow2LaborCost:       inf2 != 0 ? c.infType2 === 'channel' ? rg.channelLaborCost(inf2) : rg.pipeLaborCost(inf2) : 0,
    outflow1LaborCost:      c.outType1 === 'channel' ? rg.channelLaborCost(out1) : rg.pipeLaborCost(out1),
    outflow2LaborCost:      out2 != 0 ? c.outType2 === 'channel' ? rg.channelLaborCost(out2) : rg.pipeLaborCost(out2) : 0
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
  let lc = c.laborCost
  let lh = c.laborHrs

  let materialsCost = util.round('round', c.baseMaterialCost.total + c.plumbingMaterialCost.total, 0.01)
  let laborCost = util.round('round', lc.baseLaborCost.total + lc.dispersionLaborCost.total + lc.inflow1LaborCost.total + lc.inflow2LaborCost.total + lc.outflow1LaborCost.total + lc.outflow2LaborCost.total, 0.01)
  let laborHrs = util.round('ceil', lh.baseHrs.total + lh.dispersionHrs.total + lh.inflow1Hrs.total + lh.inflow2Hrs.total + lh.outflow1Hrs.total + lh.outflow2Hrs.total, 0.25)
  let subtotal = util.round('round', materialsCost + laborCost, 0.01)
  let tax = util.round('round', util.salesTax(subtotal), 0.01)
  let total = util.round('round', subtotal + tax, 0.01)

  return {
    //plantMaterialTotal:   rg.plantMaterialTotals(c),
    materialsCostTotal:   materials,
    laborCostTotal:       laborCost,
    laborHrsTotal:        laborHrs,
    subtotal:             subtotal,
    tax:                  tax,
    total:                total
  }
}

//what the hell is this?
rg.plantMaterialTotals = (c) => {
  return util.round('round', rg.plantCost + rg.plumbingMaterialCost.inflow1MaterialCost.channelPlantCost + rg.plumbingMaterialCost.inflow2MaterialCost.channelPlantCost + rg.plumbingMaterialCost.outflow1MaterialCost.channelPlantCost + rg.plumbingMaterialCost.outflow2MaterialCost.channelPlantCost, 0.01)
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
