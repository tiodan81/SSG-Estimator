var rgView = {}

rgView.init = () => {
  $('#rg-content').show()
    .siblings().hide()
  rgView.infiltDisplay()
  $('#rg-inflow-num').off('change').on('change', rgView.flowQty)
  $('#rg-outflow-num').off('change').on('change', rgView.flowQty)
  $('.rgflowtype').off('click').on('click', rgView.vegDisplay)
  rgView.handleSave()
  rgView.handleSelector()
  rgView.handleNav()
}

rgView.infiltDisplay = function() {
  $('#infiltKnown').off('click').on('click', function() {
    if (this.checked) {
      $('#rgInfiltContainer').show()
    } else {
      $('#rgInfiltContainer').hide()
    }
  })
}

rgView.flowQty = function() {
  if ($(this).val() == 2) {
    $(this).parent().siblings('div:last').show()
  } else {
    $(this).parent().siblings('div:last').hide()
  }
}

rgView.vegDisplay = function() {
  let $val = $(this).val()
  if ($val ==='channel') {
    $(this).parent().siblings('.rgVegContainer').show()
  } else {
    $(this).parent().siblings('.rgVegContainer').hide()
  }
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

rgView.render = (cur) => {
  rgView.populateSelector(cur)
  $('#rg-selector').val(rg.current.id)
  rgView.makeTables(cur)
  rgView.handleCollapse()
  if ($('#rg-display').css('display') === 'none') {
    $('#rg-display').show()
  }
  rgView.showSummary()
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

rgView.handleNav = function() {
  $('#rg-nav > button').off('click').on('click', function() {
    let $curNav = $('.button-primary').attr('id').split('-')[2]
    let $nextNav = $(this).attr('id').split('-')[2]
    $(this).addClass('button-primary')
      .siblings().removeClass('button-primary')
    if ($curNav != $nextNav) {
      let target = '#rg-table-' + $nextNav
      $(target).show()
        .siblings().hide()
    } else {
      return
    }
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
  $('#rg-table-materials').html(rgView.makeMaterials(rg))
}

rgView.makeSummary = (rg) => {
  let summary = ''
  summary += `
  <tr><th>Item</th><th>Cost</th></tr>
  <tr><td>Labor hours</td><td>${rg.totals.laborHrsTotal}</td></tr>
  <tr><td>Labor cost</td><td>$${rg.totals.laborCostTotal}</td></tr>
  <tr><td>Materials cost</td><td>$${rg.totals.materialsCostTotal}</td></tr>
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
  <tr data-id="10" data-parent=""><td>Inflow 1</td><td>${lh.inflow1Hrs.total}</td><td>$${lc.inflow1LaborCost.total}</td></tr>
  `
  if (rg.infNum == 2) {
    labor += `<tr data-id="11" data-parent=""><td>Inflow 2</td><td>${lh.inflow2Hrs.total}</td><td>$${lc.inflow2LaborCost.total}</td></tr>`
  } //inf2
  labor += `<tr data-id="20" data-parent=""><td>Outflow 1</td><td>${lh.outflow1Hrs.total}</td><td>$${lc.outflow1LaborCost.total}</td></tr>`

  if (rg.outNum == 2) {
    labor += `<tr data-id="21" data-parent=""><td>Outflow 2</td><td>${lh.outflow2Hrs.total}</td><td>$${lc.outflow2LaborCost.total}</td></tr>`
  } //out2

  labor += `
    <tr data-id="30" data-parent=""><td>Dispersion</td><td>${lh.dispersionHrs.total}</td><td>$${lc.dispersionLaborCost.total}</td></tr>
    <tr data-id="40" data-parent=""><td>Total</td><td>${rg.totals.laborHrsTotal}</td><td>$${rg.totals.laborCostTotal}</td></tr>
    `
  return labor
}

rgView.makeMaterials = (rg) => {
  let mat = rg.totals.materialSummary
  let materials = ''
  materials += `
  <tr><th>Item</th><th>Qty</th><th>Cost</th></tr>
  <tr><td>Planting</td><td>n/a</td><td>${mat.plantCost}</td></tr>
  <tr><td>Bioretention</td><td>${mat.bio}</td><td>$${mat.bioCost}</td></tr>
  <tr><td>Mulch</td><td>${rg.baseMaterials.bioretention}</td><td>$${rg.baseMaterialCost.mulchCost}</td></tr>
  <tr><td>Drain rock</td><td>${mat.rock}</td><td>$${mat.rockCost}</td></tr>
  <tr><td>Pond liner</td><td>${mat.pond}</td><td>$${mat.pondCost}</td></tr>
  `
  if (rg.infType1 === 'pipe' || rg.infType2 === 'pipe') {
    materials += `<tr><td>3" PVC</td><td>${mat.pvc3In}</td><td>$${mat.pvc3InCost}</td></tr>`
  }
  if (rg.outType1 === 'pipe' || rg.outType2 === 'pipe') {
    materials += `<tr><td>4" PVC</td><td>${mat.pvc4In}</td><td>$${mat.pvc4InCost}</td></tr>`
  }
  materials += `<tr><td>Sod removal</td><td>${rg.sodRmMethod}</td><td>$${mat.sodCost}</td></tr>`
  if (rg.dumpTruck) {
    materials += `<tr><td>Dump truck</td><td>n/a</td><td>$${rg.baseMaterialsCost.truckCost}</td></tr>`
  }
  materials += `<tr><td>Total</td><td></td><td>$${rg.totals.materialsCostTotal}</td></tr>`
  return materials
}
