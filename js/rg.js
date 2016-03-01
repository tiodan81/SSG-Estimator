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

rg.decider = function(c) {
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

rg.getMultiplier = function(c, rate = c.infRate) {
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

rg.allCalcs = function(cur, mult) {
  rg.getArea(cur, mult)
  rg.baseMaterials(cur)
  rg.baseMaterialCost(cur)
  rg.plumbingMaterials(cur)
  rg.plumbingMaterialCost(cur)
  cur.laborHrs = rg.laborHrs(cur)
  rg.laborCost(cur)
}

rg.getArea = function(c, m) {
  c.baseArea = Math.ceil(c.roof * m)
  c.footprint = Math.ceil((4 * c.baseArea + 2) * 0.8)
}

rg.baseMaterials = function (c) {
  c.sodVolume = util.round('ceil', c.footprint / 6 / 27, 0.5)
  c.bioretVolume = util.round('ceil', c.baseArea / 27, 0.5)
  c.mulchVolume = util.round('ceil', c.footprint / 4 / 27, 0.5)
}

rg.baseMaterialCost = function(c) {
  c.sodDumpCost = rg.calcSodDumpCost(c)
  c.bioretCost = util.round('round', c.bioretVolume * materials.bulk.bioretention, 0.01)
  c.mulchCost = util.round('round', c.mulchVolume * materials.bulk.mulch, 0.01)
  c.cutterCost = c.sodRmMethod === 'cutter' ? materials.fees.sodCutter : 0
  c.truckCost = c.dumpTruck ? materials.fees.dumpTruck : 0
  c.baseMaterialsTotal = rg.baseMaterialsTotal(c)
}

rg.baseMaterialsTotal = function(c) {
  return util.round('round', c.sodDumpCost + c.bioretCost + c.mulchCost + c.cutterCost + c.truckCost + c.plantCost, 0.01)
}

rg.calcSodDumpCost = function(c) {
  if (c.sodRmMethod === 'manual' || c.sodRmMethod === 'cutter') {
    return util.round('round', c.sodVolume * materials.fees.sodDump, 0.01)
  } else {
    return 0
  }
}

rg.plumbingMaterials = function(c) {
  c.dispersionChannelMaterials = c.roof < 1000 ? rg.channelMaterials(3) : rg.channelMaterials(6)
  c.inflowMaterials = c.infType === 'channel' ? rg.channelMaterials(c.infLen) : rg.pipeMaterials(c.infLen, 'in')
  c.outflowMaterials = c.outType === 'channel' ? rg.channelMaterials(c.outLen) : rg.pipeMaterials(c.outLen, 'out')
}

rg.channelMaterials = function(len) {
  let area = Math.round(len * 2)
  let bioret = drain = len > 3 ? util.round('ceil', area / 3 / 27, 0.5) : 0.1

  return {
    pondlinerArea: area,
    bioretention: bioret,
    drainageRock: drain
  }
}

rg.pipeMaterials = function(len, inout) {
  let type = inout === 'in' ? '3in' : '4in'

  return {
    pipe: type,
    length: len
  }
}

rg.plumbingMaterialCost = function(c) {
  c.dispersionMaterialCost = rg.channelMaterialCost(c.dispersionChannelMaterials)
  c.inflowMaterialCost = c.infType === 'channel' ? rg.channelMaterialCost(c.inflowMaterials, c.infVeg) : rg.pipeMaterialCost(c.inflowMaterials)
  c.outflowMaterialCost = c.outType === 'channel' ? rg.channelMaterialCost(c.outflowMaterials, c.outVeg) : rg.pipeMaterialCost(c.outflowMaterials)
}

rg.channelMaterialCost = function(m, veg) {
  let pondlinerCost = util.round('round', util.materialCost(m.pondlinerArea, materials.fabric.pondliner), 0.01)
  let brCost = util.round('round', util.materialCost(m.bioretention, materials.bulk.bioretention), 0.01)
  let drCost = util.round('round', util.materialCost(m.drainageRock, materials.bulk.drainageRock), 0.01)
  let plantCost = veg ? util.round('round', util.materialCost(m.pondlinerArea, materials.misc.rgChannelPlanting), 0.01) : 0

  return {
    pondlinerCost: pondlinerCost,
    bioretentionCost: brCost,
    drainageRockCost: drCost,
    channelPlantCost: plantCost
  }
}

rg.pipeMaterialCost = function(m) {
  let pipe = m.pipe === '3in' ? materials.plumbing.pvc3In : materials.plumbing.pvc4In

  return util.round('round', util.materialCost(pipe, m.length), 0.01)
}

rg.laborHrs = function(c) {
  console.log(this);
  let excavation = util.round('ceil', (c.baseArea / 2) + 3, 0.25)
  let bio = Math.round(2 * c.bioretVolume + 1)
  let mulch = Math.round(2 * c.mulchVolume + 1)
  let planting = util.round('ceil', (c.footprint / 20) + 4, 0.25)
  let inf = c.infType === 'channel' ? this.channelHrs(c.inflowMaterials, c.infLen, c.infVeg).bind(this) : this.pipeHrs(c.infLen).bind(this)
  let out = c.outType === 'channel' ? this.channelHrs(c.outflowMaterials, c.outLen, c.outVeg).bind(this) : this.pipeHrs(c.outLen).bind(this)

  let channelHrs = (mat, len, veg) => {
    let excav = len / 4
    let soil = mat.bioretention + 1
    let plant = veg ? len / 4 : 0
    let rock = mat.drainageRock + 1

    return {
      excavationHrs: excav,
      bioretenHrs: soil,
      plantHrs: plant,
      rockHrs: rock
    }
  }

  let pipeHrs = (len) => len / 4

  let sod = () => {
    if (c.sodRmMethod === 'cutter') {
      return util.round('ceil', c.footprint / 171, 0.25)
    } else if (c.sodRmMethod === 'manual') {
      return util.round('ceil', c.footprint / 60, 0.25)
    } else {
      return 0
    }
  }

  return {
    sodHrs: this.sod(),
    excavationHrs: excavation,
    bioretenHrs: bio,
    mulchHrs: mulch,
    plantingHrs: planting,
    dispersionHrs: this.channelHrs(c.dispersionChannelMaterials, 3, false),
    inflowHrs: inf,
    outflowHrs: out
  }
}
