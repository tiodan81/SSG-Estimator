var rgView = {}

rgView.init = () => {
  $('#rg-content').show()
    .siblings().hide()
  rgView.infiltDisplay()
  $('#rg-inflow-num').off('change').on('change', rgView.flowQty)
  $('#rg-outflow-num').off('change').on('change', rgView.flowQty)
  rgView.vegInfDisplay()
  rgView.vegOutDisplay()
  rgView.handleSave()
}

rgView.infiltDisplay = () => {
  $('#infiltKnown').off('click').on('click', function() {
    if (this.checked) {
      $('#rgInfiltContainer').show()
    } else {
      $('#rgInfiltContainer').hide()
    }
  })
}

rgView.flowQty = function() {
  console.log($(this).val());
  if ($(this).val() == 2) {
    $(this).parent().siblings('div:last').show()
  } else {
    $(this).parent().siblings('div:last').hide()
  }
}

rgView.vegInfDisplay = () => {
  $('input[name=rgInflow]').off('click').on('click', function() {
    let val = $('input[name=rgInflow]:checked').val()
    if (val ==='channel') {
      $('#rgVegInfContainer').show()
    } else {
      $('#rgVegInfContainer').hide()
    }
  })
}

rgView.vegOutDisplay = () => {
  $('input[name=rgOutflow]').off('click').on('click', function() {
    let val = $('input[name=rgOutflow]:checked').val()
    if (val ==='channel') {
      $('#rgVegOutContainer').show()
    } else {
      $('#rgVegOutContainer').hide()
    }
  })
}

rgView.handleSave = () => {
  $('#rgForm').off('submit').on('submit', function(e) {
    e.preventDefault()
    let $val = $('#rg-save').val()
    if ($val === 'save') {
      rgController.makeNew()
      viewUtil.clearForm()
    } else if ($val === 'update') {
      //do the update stuff
    }
  })
}

rgView.render = (rg) => {
  rgView.populateSelector(rg)
  rgView.makeTables(rg)
  rgView.handleCollapse()
  //show tables if not shown
  //pop to summary
  //show/handle edit buttons
}

rgView.populateSelector = (cur) => {
  let curId = cur.id
  if ($('#rg-selector option[value="' + curId + '"]').length === 0) {
    let option = '<option value="' + curId + '">' + curId + '</option>'
    $('#rg-selector').append(option)
  }
}

rgView.handleSelector = function() {
  $('#rg-selector').off('change').on('change', function() {
    let id = $('#rg-selector').val()
    if (id === 'All rain gardens') {
      rgView.makeTables(rg.uberTank)
      $('#rg-edit-buttons').hide()
    } else {
      let curRG = util.findObjInArray(id, project.rainGardens.uberRG, 'id')
      rgView.makeTables(curRG[0])
      rg.current = curRG[0]
      $('#rg-edit-buttons').show()
    }
    rgView.showSummary()
  })
}

rgView.showSummary = function() {
  let $selected = $('.button-primary').attr('id').split('-')[2]
  if ($selected != 'summary') {
    $('#rg-nav-summary').addClass('button-primary')
    .siblings().removeClass('button-primary')
    $('#rg-table-summary').show()
    .siblings().hide()
  }
}

rgView.handleCollapse = function() {
  $('.collaptable').aCollapTable({
  // the table is collapased at start
    startCollapsed: true,
  // the plus/minus button will be added like a column
    addColumn: true,
  // The expand button ("plus" +)
    plusButton: '<span class="i">+</span>',
  // The collapse button ("minus" -)
    minusButton: '<span class="i">-</span>'
  })
}

rgView.makeTables = (rg) => {
  $('#rg-table-summary').html(rgView.makeSummary(rg))
  $('#rg-table-labor').html(rgView.makeLabor(rg))
  //$('#rg-table-materials').html(rgView.makeMaterials(rg))
}

rgView.makeSummary = (rg) => {
  let summary = ''
  summary += `
  <tr><th>Item</th><th>Cost</th></tr>
  <tr><td>Labor hours</td><td>${rg.totals.laborHrsTotal}</td></tr>
  <tr><td>Labor cost</td><td>$${rg.totals.laborCostTotal}</td></tr>
  <tr><td>Materials cost</td><td>$${rg.totals.materialsTotal}</td></tr>
  <tr><td>Tax</td><td>$${rg.totals.tax}</td></tr>
  <tr><td>Total</td><td>$${rg.totals.total}</td></tr>
  `
  return summary
}

rgView.makeLabor = (rg) => {
  let lh = rg.laborHrs
  let lc = rg.laborCost
  let labor = ''
  labor += `
  <tr><th>Item</th><th>Hours</th><th>Cost</th></tr>
  <tr data-id="1" data-parent=""><td>Base</td><td>${lh.baseHrs.total}</td><td>$${lc.baseLaborCost.total}</td></tr>
  <tr data-id="2" data-parent="1"><td>Sod Removal</td><td>${lh.baseHrs.sodHrs}</td><td>$${lc.baseLaborCost.sodLaborCost}</td></tr>
  <tr data-id="3" data-parent="1"><td>Excavation</td><td>${lh.baseHrs.excavationHrs}</td><td>$${lc.baseLaborCost.excavationLaborCost}</td></tr>
  <tr data-id="4" data-parent="1"><td>Bioretention</td><td>${lh.baseHrs.bioretenHrs}</td><td>$${lc.baseLaborCost.bioretentionLaborCost}</td></tr>
  <tr data-id="5" data-parent="1"><td>Mulch</td><td>${lh.baseHrs.mulchHrs}</td><td>$${lc.baseLaborCost.mulchLaborCost}</td></tr>
  <tr data-id="6" data-parent="1"><td>Planting</td><td>${lh.baseHrs.plantingHrs}</td><td>$${lc.baseLaborCost.plantingLaborCost}</td></tr>
  <tr data-id="10" data-parent=""><td>Inflow</td><td>${lh.inflowHrs.total}</td><td>$${lc.inflowLaborCost.total}</td></tr>
  `
  //will break if rg has channel & pipe in/out
  if (rg.infType === 'channel') {
    labor += `
    <tr data-id="10" data-parent="2"><td>Excavation</td><td>${lh.inflowHrs.excavationHrs}</td><td>$${lc.inflowLaborCost.excavationLaborCost}</td></tr>
    <tr data-id="11" data-parent="2"><td>Bioretention</td><td>${lh.inflowHrs.bioretenHrs}</td><td>$${lc.inflowLaborCost.bioretentionLaborCost}</td></tr>
    <tr data-id="12" data-parent="2"><td>Planting</td><td>${lh.inflowHrs.plantingHrs}</td><td>$${lc.inflowLaborCost.plantingLaborCost}</td></tr>
    <tr data-id="13" data-parent="2"><td>Drain rock</td><td>${lh.inflowHrs.rockHrs}</td><td>$${lc.inflowLaborCost.rockLaborCost}</td></tr>
    `
  } else {
    labor += `<tr data-id="14" data-parent="2"><td>Inflow pipe</td><td>${lh.inflowHrs.pipeHrs}</td><td>$${lc.inflowLaborCost.total}</td></tr>`
  }

  labor += `<tr data-id="20" data-parent=""><td>Outflow</td><td>${lh.outflowHrs.total}</td><td>$${lc.outflowLaborCost.total}</td></tr>`
  if (rg.outType === 'channel') {
    labor += `
    <tr data-id="21" data-parent="20"><td>Excavation</td><td>${lh.outflowHrs.excavationHrs}</td><td>$${lc.outflowLaborCost.excavationLaborCost}</td></tr>
    <tr data-id="22" data-parent="20"><td>Bioretention</td><td>${lh.outflowHrs.bioretenHrs}</td><td>$${lc.outflowLaborCost.bioretentionLaborCost}</td></tr>
    <tr data-id="23" data-parent="20"><td>Planting</td><td>${lh.outflowHrs.plantingHrs}</td><td>$${lc.outflowLaborCost.plantingLaborCost}</td></tr>
    <tr data-id="24" data-parent="20"><td>Drain rock</td><td>${lh.outflowHrs.rockHrs}</td><td>$${lc.outflowLaborCost.rockLaborCost}</td></tr>
    `
  } else {
    labor += `<tr data-id="25" data-parent="20"><td>Outflow pipe</td><td>${lh.outflowHrs.pipeHrs}</td><td>$${lc.outflowLaborCost.total}</td></tr>`
  }

  labor += `<tr data-id="30" data-parent=""><td>Dispersion</td><td>${lh.dispersionHrs.total}</td><td>$${lc.dispersionLaborCost.total}</td></tr>
    <tr data-id="31" data-parent="30"><td>Excavation</td><td>${lh.dispersionHrs.excavationHrs}</td><td>$${lc.dispersionLaborCost.excavationLaborCost}</td></tr>
    <tr data-id="32" data-parent="30"><td>Bioretention</td><td>${lh.dispersionHrs.bioretenHrs}</td><td>$${lc.dispersionLaborCost.bioretentionLaborCost}</td></tr>
    <tr data-id="34" data-parent="30"><td>Drain rock</td><td>${lh.dispersionHrs.rockHrs}</td><td>$${lc.dispersionLaborCost.rockLaborCost}</td></tr>
    <tr data-id="40" data-parent=""><td>Total</td><td>${rg.totals.laborHrsTotal}</td><td>$${rg.totals.laborCostTotal}</td></tr>`
  return labor
}

rgView.makeMaterials = (rg) => {
  //need channel/pipe branching
  let bio = util.round('round', rg.baseMaterials.bioretentionVolume + rg.plumbingMaterials.dispersionChannelMaterials.bioretention + rg.plumbingMaterials.inflowMaterials.bioretention + rg.plumbingMaterials.outflowMaterials.bioretention ,0.01)
  // let bioCost =
  // let rock =
  // let rockCost =
  // let pond =
  // let pondCost =
  let sodCost = util.round('round', rg.baseMaterialCost.cutterCost + rg.baseMaterialCost.sodDumpCost, 0.01)
}

// MATERIALS
//   bioretention = base + disp + inf + out
//   mulch = base
//   drain rock = disp + inf + out
//   pond liner = disp + inf + out
//   pipe
//     3" len
//     4" len
//   sodRm | method | cutterCost + sodDumpCost
//   Truck
//   total
