var rgView = {}

rgView.init = () => {
  $('#rg-content').show()
    .siblings().hide()
  rgView.displayExisting()
  rgView.infiltDisplay()
  $('#rg-inflow-num').off('change').on('change', rgView.flowQty)
  $('#rg-outflow-num').off('change').on('change', rgView.flowQty)
  $('.rgflowtype').off('click').on('click', rgView.vegDisplay)
  rgView.handleSave()
  rgView.handleSelector()
  rgView.handleNav()
}

rgView.displayExisting = () => {
  let $existing = project.current.rainGardens
  if ($existing.all.length) {
    $('#rg-selector').empty()
    $existing.all.forEach((e) => {
      rgView.populateSelector(e)
    })
    rgView.populateSelector($existing.uber)
    rg.current = $existing.all[0]    //handle on project load? like this it won't save state on nav within session
    rgView.render(rg.current)
  } else {
    return
  }
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
  $('#rg-form').off('submit').on('submit', function(e) {
    e.preventDefault()
    let $val = $('#rg-save').val()
    if ($val === 'save') {
      let dupe = rg.preventDuplicates()
      if (dupe) {
        alert('That id has already been used. Please choose a different id.')
        return false
      }
      rgController.save()
      rgView.clearForm()
    } else if ($val === 'update') {
      rgController.save()
      rgView.clearForm()
      $('#rg-save').val('save')
    }
  })
}

rgView.render = function(cur) {
  rgView.populateSelector(cur)
  $('#rg-selector').val(cur.id)
  rgView.makeTables(cur)
  if ($('#rg-display').css('display') === 'none') {
    $('#rg-display').show()
  }
  rgView.showSummary()
  rgView.editButtons()
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
    const id = $('#rg-selector').val()
    const re = /(low estimate)/

    if (id === 'All rain gardens') {
      rgView.makeTables(project.current.rainGardens.uber)
      $('#rg-edit-buttons').hide()
    } else {
      let curRG = util.findObjInArray(id, project.current.rainGardens.all, 'id')
      rgView.makeTables(curRG[0])
      rg.current = curRG[0]

      if (re.test(id)) {
        $('#rg-edit-buttons').hide()
      } else {
        $('#rg-edit-buttons').show()
      }
    }
    rgView.showSummary()
  })
}

rgView.handleNav = function() {
  $('#rg-nav > button').off('click').on('click', function() {
    let $curNav = $('#rg-nav > .button-primary').attr('id')
    let $nextNav = $(this).attr('id')
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
  let $selected = $('#rg-nav .button-primary').attr('id')
  if ($selected != 'summary') {
    $('#rg-nav > #summary').addClass('button-primary')
    .siblings().removeClass('button-primary')
    $('#rg-table-summary').show()
    .siblings().hide()
  }
}

rgView.editButtons = function() {
  $('#rg-edit-buttons').show()
  rgView.handleEdit()
  rgView.handleDelete()
}

rgView.handleEdit = function() {
  $('#rg-edit-buttons .icon-pencil2').off('click').on('click', function(e) {
    rgView.populateForm(rg.current)
    $('#rg-save').val('update')
  })
}

rgView.handleDelete = function() {
  $('#rg-edit-buttons .icon-bin2').off('click').on('click', function() {
    let old = rg.current.id
    let low = old + ' - low estimate'
    let all = project.current.rainGardens.all

    _.remove(all, (e) => {
      return e.id == old || e.id === low
    })

    $('#rg-selector > option[value="' + old + '"]').remove()
    $('#rg-selector > option[value="' + low + '"]').remove()
    rg.updateUberRG()

    if (all.length) {
      rg.current = all[0]
      $('#rg-selector').val(rg.current.id)
      rgView.makeTables(rg.current)
      rgView.showSummary()
      rgView.editButtons()
    } else {
      rg.current = {}
      project.current.rainGardens = { all: [], uber: {} }
      $('#rg-display').hide()
    }
    project.updateComponent(project.current, 'rainGardens')
  })
}

rgView.populateForm = function(cur) {
  //need to show/display appropriate fields for infilt, inout2
  $('#rgID').val(cur.id)
  $('#rg-roofArea').val(cur.roof)
  $('#infiltKnown').prop('checked', cur.infKnown)
  $('#rgInfiltRate').val(cur.infRate)
  $('#rgPlantBudget').val(cur.plantCost)
  $('#rg-inflow-num').val(cur.infNum)
  $('input[name="rgInflow1"][value="' + cur.infType1 + '"]').prop('checked', true)
  $('#rgVegInflow1').prop('checked', cur.infVeg1)
  $('#rgInfLength1').val(cur.infLen1)
  $('input[name="rgInflow2"][value="' + cur.infType2 + '"]').prop('checked', true)
  $('#rgVegInflow2').prop('checked', cur.infVeg2)
  $('#rgInfLength2').val(cur.infLen2)
  $('#rg-outflow-num').val(cur.outNum)
  $('input[name="rgOutflow1"][value="' + cur.outType1 + '"]').prop('checked', true)
  $('#rgVegOutflow1').prop('checked', cur.outVeg1)
  $('#rgOutLength1').val(cur.outLen1)
  $('input[name="rgOutflow2"][value="' + cur.outType2 + '"]').prop('checked', true)
  $('#rgVegOutflow2').prop('checked', cur.outVeg2)
  $('#rgOutLength2').val(cur.outLen2)
  $('#fedByCistern').prop('checked', cur.fedByCistern)
  $('input[name="rgSod"][value="' + cur.sodRmMethod + '"]').prop('checked', true)
  $('#rgDumpTruck').prop('checked', cur.dumpTruck)
}

rgView.clearForm = function() {
  $('#rg-form input[type="text"]').val('')
  $('#rg-form input[type="number"]').val('')
  $('#rg-form input[type="checkbox"]').prop('checked', false)
  $('#rg-form input[type="radio"]').prop('checked', false)
  $('#rg-form select').val('1')
  $('#rgInfiltContainer').hide()
  $('#rgInflow2-container').hide()
  $('#rgOutflow2-container').hide()
}

rgView.makeTables = (rg) => {
  $('#rg-table-summary').html(rgView.makeSummary(rg))
  $('#rg-table-labor').html(rgView.makeLabor(rg))
  $('#rg-table-materials').html(rgView.makeMaterials(rg))
}

rgView.makeSummary = (rg) => {
  let summary = ''
  summary += `
  <tr><th>Item</th><th>Amount</th></tr>
  <tr><td>Labor hours</td><td>${rg.totals.laborHrsTotal}</td></tr>
  <tr><td>Labor cost</td><td class="money">$${rg.totals.laborCostTotal.toFixed(2)}</td></tr>
  <tr><td>Materials cost</td><td class="money">$${rg.totals.materialsCostTotal.toFixed(2)}</td></tr>
  <tr><td>Tax</td><td class="money">$${rg.totals.tax.toFixed(2)}</td></tr>
  <tr class="total-row"><td>Total</td><td class="money">$${rg.totals.total.toFixed(2)}</td></tr>
  `
  return summary
}

rgView.makeLabor = (rg) => {
  let labor = ''
  labor += `
  <tr><th>Item</th><th>Hours</th><th>Cost</th></tr>
  <tr><td>Sod Removal</td><td>${rg.baseHrs.sodHrs}</td><td class="money">$${rg.baseLaborCost.sodLaborCost.toFixed(2)}</td></tr>
  <tr><td>Excavation</td><td>${rg.baseHrs.excavationHrs}</td><td class="money">$${rg.baseLaborCost.excavationLaborCost.toFixed(2)}</td></tr>
  <tr><td>Bioretention</td><td>${rg.baseHrs.bioretenHrs}</td><td class="money">$${rg.baseLaborCost.bioretentionLaborCost.toFixed(2)}</td></tr>
  <tr><td>Mulch</td><td>${rg.baseHrs.mulchHrs}</td><td class="money">$${rg.baseLaborCost.mulchLaborCost.toFixed(2)}</td></tr>
  <tr><td>Planting</td><td>${rg.baseHrs.plantingHrs}</td><td class="money">$${rg.baseLaborCost.plantingLaborCost.toFixed(2)}</td></tr>
  <tr><td>Inflow 1</td><td>${rg.inflow1Hrs}</td><td class="money">$${rg.inflow1LaborCost.toFixed(2)}</td></tr>
  `
  if (rg.infNum == 2) {
    labor += `<tr><td>Inflow 2</td><td>${rg.inflow2Hrs}</td><td class="money">$${rg.inflow2LaborCost.toFixed(2)}</td></tr>`
  }
  labor += `<tr><td>Outflow 1</td><td>${rg.outflow1Hrs}</td><td class="money">$${rg.outflow1LaborCost.toFixed(2)}</td></tr>`

  if (rg.outNum == 2) {
    labor += `<tr><td>Outflow 2</td><td>${rg.outflow2Hrs}</td><td class="money">$${rg.outflow2LaborCost.toFixed(2)}</td></tr>`
  }

  labor += `
    <tr><td>Dispersion</td><td>${rg.dispersionHrs}</td><td class="money">$${rg.dispersionLaborCost.toFixed(2)}</td></tr>
    <tr  class="total-row"><td>Total</td><td>${rg.totals.laborHrsTotal}</td><td class="money">$${rg.totals.laborCostTotal.toFixed(2)}</td></tr>
    `
  return labor
}

rgView.makeMaterials = (rg) => {
  let mat = rg.materialSummary
  let materials = ''
  materials += `
  <tr><th>Item</th><th>Qty</th><th>Cost</th></tr>
  <tr><td>Planting</td><td></td><td class="money">$${mat.plantCost.toFixed(2)}</td></tr>
  <tr><td>Bioretention</td><td>${mat.bio} yd</td><td class="money">$${mat.bioCost.toFixed(2)}</td></tr>
  <tr><td>Mulch</td><td>${rg.baseMaterials.bioretention} yd</td><td class="money">$${rg.baseMaterialCost.mulchCost.toFixed(2)}</td></tr>
  <tr><td>Drain rock</td><td>${mat.rock} yd</td><td class="money">$${mat.rockCost.toFixed(2)}</td></tr>
  <tr><td>Pond liner</td><td>${mat.pond} ft²</td><td class="money">$${mat.pondCost.toFixed(2)}</td></tr>
  `
  if (rg.infType1 === 'pipe' || rg.infType2 === 'pipe') {
    materials += `<tr><td>3" PVC</td><td>${mat.pvc3In} ft</td><td class="money">$${mat.pvc3InCost.toFixed(2)}</td></tr>`
  }
  if (rg.outType1 === 'pipe' || rg.outType2 === 'pipe') {
    materials += `<tr><td>4" PVC</td><td>${mat.pvc4In} ft</td><td class="money">$${mat.pvc4InCost.toFixed(2)}</td></tr>`
  }
  materials += `<tr><td>Sod removal</td><td>${rg.baseMaterials.sodVolume} yd</td><td class="money">$${mat.sodDumpCost.toFixed(2)}</td></tr>`
  if (rg.sodRmMethod === 'cutter') {
    materials += `<tr><td>Sod cutter</td><td></td><td class="money">$${rg.cutterCost.toFixed(2)}</td></tr>`
  }
  if (rg.dumpTruck) {
    materials += `<tr><td>Dump truck</td><td></td><td class="money">$${rg.truckCost.toFixed(2)}</td></tr>`
  }
  materials += `<tr class="total-row"><td>Total</td><td></td><td class="money">$${rg.totals.materialsCostTotal.toFixed(2)}</td></tr>`
  return materials
}
