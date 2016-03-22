var cisternView = {}

cisternView.init = function() {
  $('#cistern-content').show()
    .siblings().hide()
  cisternView.displayExisting()
  cisternView.handleSave()
  //cisternView.handleAddOns()
  cisternView.handleSelector()
  cisternView.handleNav()
  cisternView.handleDelete()    //see rgVIew.editButtons
}

cisternView.displayExisting = function() {
  let $existing = project.current.cisterns
  if ($existing.all.length) {
    $('#cistern-selector').empty()
    $existing.all.forEach(function(e) {
      cisternView.populateSelector(e)
    })
    cisternView.populateSelector($existing.uber)
    cistern.current = $existing.all[0]
    cisternView.render(cistern.current)
  } else {
    return
  }
}

cisternView.handleAddOns = function() {
  $('#cisternAddOns').on('change', function() {
    let addOn = $(this).val()
    let count = $("'#" + addOn + "'").data('count')
    count = count != 0 ? count : 1
    //let count = $("'#" + addOn + "'").length ? cisternView.getAddOnCount(addOn) + 1 : 1
    $(this).parent().after(cisternView.makeAddOn(addOn, count))
  })
}

cisternView.getAddOnCount = function(a) {
  return $("'#" + a + "'").data('count')
}

cisternView.makeAddOn = function(addOn, count) {
  let html = ''
  html += `<div class="fe">
  <label id="${addOn}" data-count="${count} class="fieldname">${count} -</label>
  <p>${addOn}</p>
  `
  return html
}

cisternView.handleSave = function() {
  $('#cistern-save').off('click').on('click', function(e) {
    e.preventDefault()
    let $val = $('#cistern-save').val()
    if ($val === 'save') {
      let dupe = cistern.preventDuplicates()
      if (dupe) {
        alert('That id has already been used. Please choose a different id.')
        return false
      }
      cisternController.save()
      viewUtil.clearForm()
    } else if ($val === 'update') {
      cisternController.save()
      viewUtil.clearForm()
      $('#cistern-save').val('save')
    }
  })
}

cisternView.render = function(cur) {
  cisternView.populateSelector(cur)
  $('#cistern-selector').val(cur.id)
  cisternView.makeTables(cur)
  if ($('#cistern-display').css('display') === 'none') {
    $('#cistern-display').show()
  }
  cisternView.showSummary()
  cisternView.editButtons()
}

cisternView.populateSelector = function(cur) {
  let curId = cur.id
  if ($('#cistern-selector option[value="' + curId + '"]').length === 0) {
    let option = '<option value="' + curId + '">' + curId + '</option>'
    $('#cistern-selector').append(option)
  }
}

cisternView.showSummary = function() {
  let $selected = $('#cistern-nav .button-primary').attr('id')
  if ($selected != 'summary') {
    $('#cistern-nav > #summary').addClass('button-primary')
      .siblings().removeClass('button-primary')
    $('#cistern-table-summary').show()
      .siblings().hide()
  }
}

cisternView.handleSelector = function() {
  $('#cistern-selector').off('change').on('change', function() {
    let id = $('#cistern-selector').val()
    if (id === 'All tanks') {
      cisternView.makeTables(project.current.cisterns.uber)
      $('#cistern-edit-buttons').hide()
    } else {
      let curCistern = util.findObjInArray(id, project.current.cisterns.all, 'id')
      cisternView.makeTables(curCistern[0])
      cistern.current = curCistern[0]
      $('#cistern-edit-buttons').show()
    }
    cisternView.showSummary()
  })
}

cisternView.handleNav = function() {
  $('#cistern-nav > button').off('click').on('click', function() {
    let $curNav = $('#cistern-nav > .button-primary').attr('id')
    let $nextNav = $(this).attr('id')
    $(this).addClass('button-primary')
      .siblings().removeClass('button-primary')
    if ($curNav != $nextNav) {
      let target = '#cistern-table-' + $nextNav
      $(target).show()
        .siblings().hide()
    } else {
      return
    }
  })
}

cisternView.makeTables = function(cur) {
  $('#cistern-table-summary').html(cisternView.makeSummary(cur))
  $('#cistern-table-labor').html(cisternView.makeLabor(cur))
  $('#cistern-table-materials').html(cisternView.makeMaterials(cur))
}

cisternView.makeSummary = function(cur) {
  let summary = ''
  summary += `
  <tr><th>Item</th><th>Cost</th></tr>
  <tr><td>Model</td><td>${cur.model}</td></tr>
  <tr><td>Labor hours</td><td>${cur.laborHrsTotal}</td></tr>
  <tr><td>Labor cost</td><td>$${cur.laborCostTotal}</td></tr>
  <tr><td>Materials cost</td><td>$${cur.materialsCostTotal}</td></tr>
  <tr><td>Tax</td><td>$${cur.tax}</td></tr>
  <tr><td>Total</td><td>$${cur.total}</td></tr>
  `
  return summary
}

cisternView.makeLabor = function(cur) {
  let labor = ''
  labor += `
  <tr><th>Item</th><th>Hours</th><th>Cost</th></tr>
  <tr><td>Base</td><td>${cur.baseLaborHr}</td><td>$${cur.baseLaborCost}</td></tr>
  <tr><td>Inflow</td><td>${cur.inflowLaborHr}</td><td>$${cur.inflowLaborCost}</td></tr>
  <tr><td>Outflow</td><td>${cur.outflowLaborHr}</td><td>$${cur.outflowLaborCost}</td></tr>
  `
  if (cur.additionalLaborHr) {
    labor += `<tr><td>Additional</td><td>${cur.additionalLaborHr}</td><td>$${cur.additionalLaborCost}</td></tr>`
  }
  labor += `<tr><td>Total</td><td>${cur.laborHrsTotal}</td><td>$${cur.laborCostTotal}</td></tr>`
  return labor
}

cisternView.makeMaterials = function(cur) {
  // Object.keys(cur).forEach(function(e) {
  //   if key is number, toFixed(2)
  // })
  let materials = ''
  materials += `
  <tr><th>Item</th><th>Qty</th><th>Cost</th></tr>
  <tr><td>Tank</td><td>1</td><td>$${cur.salePrice}</td></tr>
  <tr><td>Paverbase</td><td>${cur.paverbase}yd</td><td>$${cur.paverbaseCost}</td></tr>
  `
  if (cur.manorStones != 0) {
    materials += `<tr><td>Manor stones</td><td>${cur.manorStones}</td><td>$${cur.manorStoneCost}</td></tr>`
  }
  if (cur.cinderBlocks != 0) {
    materials += `<tr><td>Cinder blocks</td><td>${cur.cinderBlocks}</td><td>$${cur.cinderBlockCost}</td></tr>`
  }
  materials += `
  <tr><td>Inflow pipe</td><td>${cur.inflow}ft</td><td>$${cur.inflowPipeCost}</td></tr>
  <tr><td>Inflow hardware</td><td>${cur.inflowHardware}</td><td>$${cur.inflowHdwCost}</td></tr>
  <tr><td>Outflow pipe</td><td>${cur.outflow}ft</td><td>$${cur.outflowPipeCost}</td></tr>
  <tr><td>Outflow hardware</td><td>${cur.outflowHardware}</td><td>$${cur.outflowHdwCost}</td></tr>
  `
  if (cur.slimlineRestraints) {
    materials += `<tr><td>Slimeline restraints</td><td>1</td><td>$${cur.slimlineRestraints}</td></tr>`
  }
  if (cur.bulkheadKit) {
    materials += `<tr><td>Bulkhead kit</td><td>1</td><td>$${cur.bulkheadKit}</td></tr>`
  }
  materials += `
  <tr><td>Low-flow kit</td><td>1</td><td>$75.00</td></tr>
  <tr><td>Total</td><td></td><td>$${cur.materialsCostTotal}</td></tr>
  `
  return materials
}

cisternView.editButtons = function() {
  let buttons = ''
  buttons += `
  <span class="icon-pencil2"></span>
  <span class="icon-bin2"></span>
  `
  $('#cistern-edit-buttons').empty().html(buttons)
  cisternView.handleDelete()
}

cisternView.handleEdit = function() {
  $('#cistern-edit-buttons .icon-pencil2').off('click').on('click', function(e) {
    cisternView.populateForm(cistern.current)
    $('#cistern-save').val('update')
  })
}

cisternView.handleDelete = function() {
  $('#cistern-edit-buttons .icon-bin2').off('click').on('click', function(e) {
    let old = cistern.current
    let all = project.current.cisterns.all
    all.forEach(function(e, i) {
      if (e.id === old.id) {
        all.splice(i, 1)
      }
    })
    $('#cistern-selector > option[value="' + old.id + '"]').remove()
    cistern.updateUberTank()
    if (all.length) {
      cistern.current = all[0]
      $('#cistern-selector').val(cistern.current.id)
      cisternView.makeTables(cistern.current)
      cisternView.showSummary()
      cisternView.editButtons()
    } else {
      cistern.current = {}
      project.current.cisterns = { all: [], uber: {} }
      $('#cistern-display').hide()
    }
    project.updateComponent(project.current, 'cisterns')
  })
}

cisternView.populateForm = function(cur) {
  $('#cistern').val(cur.id)
  $('#cisternModel').val(cur.model)
  $('#cisternBase').val(cur.baseHeight)
  $('#gutterFt').val(cur.gutter)
  $('#cisternInflow').val(cur.inflow)
  $('#cisternOutflow').val(cur.outflow)
  $('#cisternAddLabor').val(cur.additionalLaborHr)
}
