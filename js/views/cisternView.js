var cisternView = {}

cisternView.init = function() {
  $('#cistern-content').show()
    .siblings().hide()
  cisternView.displayExisting()
  cisternView.handleNew()
  //cisternView.handleAddOns()
  cisternView.handleSelector()
  cisternView.handleNav()
  cisternView.handleUpdate()
  cisternView.handleDelete()
}

cisternView.displayExisting = function() {
  if (cistern.allCisterns.length) {
    $('#cistern-selector').empty()
    cistern.allCisterns.forEach(function(e) {
      cisternView.populateSelector(e)
    })
    cisternView.populateSelector(cistern.uberTank)
    cisternView.renderNew(cistern.current)
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

cisternView.handleNew = function() {
  $('#cistern-add').off('click').on('click', function(e) {
    e.preventDefault()
    let newCistern = cistern.buildCistern()
    cistern.allCalcs(newCistern)
    cistern.allCisterns.push(newCistern)
    cisternView.renderNew(newCistern)
    cistern.updateUberTank()
    cistern.saveToProject()
    cistern.current = newCistern
    viewUtil.clearForm()
  })
}

cisternView.renderNew = function(cur) {
  const $display = $('#cistern-display')
  cisternView.populateSelector(cur)
  $('#cistern-selector').val(cur.cisternId)
  cisternView.makeTables(cur)
  if ($display.css('display') === 'none') {
    $display.show()
  }
  cisternView.showSummary()
  cisternView.editButtons()
}

cisternView.populateSelector = function(cur) {
  let curId = cur.cisternId
  if ($('#cistern-selector option[value="' + curId + '"]').length === 0) {
    let option = '<option value="' + curId + '">' + curId + '</option>'
    $('#cistern-selector').append(option)
  }
}

cisternView.showSummary = function() {
  let $selected = $('.button-primary').attr('id').split('-')[2]
  if ($selected != 'summary') {
    $('#cistern-nav-summary').addClass('button-primary')
      .siblings().removeClass('button-primary')
    $('#cistern-table-summary').show()
      .siblings().hide()
  }
}

cisternView.handleSelector = function() {
  $('#cistern-selector').off('change').on('change', function() {
    let id = $('#cistern-selector').val()
    if (id === 'All tanks') {
      cisternView.makeTables(cistern.uberTank)
      $('#cistern-edit-buttons').hide()
    } else {
      let curCistern = util.findObjInArray(id, cistern.allCisterns, 'cisternId')
      cisternView.makeTables(curCistern[0])
      cistern.current = curCistern[0]
      $('#cistern-edit-buttons').show()
    }
    cisternView.showSummary()
  })
}

cisternView.handleNav = function() {
  $('#cistern-nav > button').off('click').on('click', function() {
    let $curNav = $('.button-primary').attr('id').split('-')[2]
    let $nextNav = $(this).attr('id').split('-')[2]
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
  <tr><td>Labor hours</td><td>${cur.totalHr}</td></tr>
  <tr><td>Labor cost</td><td>$${cur.laborTotal}</td></tr>
  <tr><td>Materials cost</td><td>$${cur.materialsTotal}</td></tr>
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
  labor += `<tr><td>Total</td><td>${cur.totalHr}</td><td>$${cur.laborTotal}</td></tr>`
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
  <tr><td>Total</td><td></td><td>$${cur.materialsTotal}</td></tr>
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
  cisternView.handleEdit()
  cisternView.handleDelete()
}

cisternView.handleEdit = function() {
  $('#cistern-edit-buttons .icon-pencil2').off('click').on('click', function(e) {
    e.preventDefault()
    let cur = cistern.current
    cisternView.populateForm(cur)
    $('#cistern-add').hide()
    $('#cistern-update').show()
  })
}

cisternView.handleUpdate = function() {
  $('#cistern-update').off('click').on('click', function(e) {
    e.preventDefault()
    let old = cistern.current
    let updated = cistern.buildCistern()
    cistern.allCalcs(updated)
    cistern.allCisterns.forEach(function(c, i) {
      if (updated.cisternId === c.cisternId) {
        cistern.allCisterns[i] = updated
      }
    })
    cistern.updateUberTank()
    cisternView.renderNew(updated)
    cistern.current = updated
    cistern.saveToProject()
    viewUtil.clearForm()
    $('#cistern-update').hide()
    $('#cistern-add').show()
  })
}

cisternView.handleDelete = function() {
  $('#cistern-edit-buttons .icon-bin2').off('click').on('click', function(e) {
    e.preventDefault()
    let old = cistern.current
    let all = cistern.allCisterns
    all.forEach(function(e, i) {
      if (e.cisternId === old.cisternId) {
        all.splice(i, 1)
      }
    })
    $('#cistern-selector > option[value="' + old.cisternId + '"]').remove()
    cistern.updateUberTank()
    cistern.saveToProject()
    if (all.length) {
      cistern.current = all[0]
      let cur = cistern.current
      $('#cistern-selector').val(cur.cisternId)
      cisternView.makeTables(cur)
      cisternView.showSummary()
      cisternView.editButtons()
    } else {
      cistern.current = {}
      $('#cistern-display').hide()
    }
  })
}

cisternView.populateForm = function(cur) {
  $('#cistern').val(cur.cisternId)
  $('#cisternModel').val(cur.model)
  $('#cisternBase').val(cur.baseHeight)
  $('#gutterFt').val(cur.gutter)
  $('#cisternInflow').val(cur.inflow)
  $('#cisternOutflow').val(cur.outflow)
  $('#cisternAddLabor').val(cur.additionalLaborHr)
}
