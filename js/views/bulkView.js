var bulkView = {}

bulkView.init = function() {
  $('#bulk-content').show()
    .siblings().hide()
  bulkView.displayExisting()
  bulkView.handleSave()
}

bulkView.displayExisting = function() {
  let $existing = project.current.bulkMaterials

  if ($existing.all.length) {
    $('#bulk-selector').empty()

    $existing.all.forEach((e) => {
      bulkView.populateSelector(e)
    })
    $('#bulk-selector').hide()
    $('#bulk-nav > button:first-child').addClass('button-primary')
      .siblings().removeClass('button-primary')
    bulkView.renderSummary()
    bulkView.handleNav()
  } else {
    return
  }
}

bulkView.handleSave = function() {
  $('#bulk-form').off('submit').on('submit', function(e) {
    e.preventDefault()
    let $val = $('#bulk-save').val()
    if ($val === 'save') {
      let dupe = bulk.preventDuplicates()
      if (dupe) {
        alert('That id has already been used. Please choose a different id.')
        return false
      }
      bulkController.save()
      bulkView.clearForm()
    } else if ($val === 'update') {
      bulkController.save()
      bulkView.clearForm()
      $('#bulk-save').val('save')
    }
  })
}

bulkView.renderSummary = function() {
  $('#bulk-table').html(bulkView.makeSummary(project.current.bulkMaterials))
  $('#bulk-selector').hide()
  if ($('#bulk-display').css('display') === 'none') {
    $('#bulk-display').show()
  }
}

bulkView.renderDetails = function(t) {
  $('#bulk-table').html(bulkView.makeDetails(t))
  if ($('#bulk-display').css('display') === 'none') {
    $('#bulk-display').show()
  }
  $('#bulk-selector').show()
  bulkView.handleSelector()
  bulkView.handleEdit()
  bulkView.handleDelete()
}

bulkView.populateSelector = function(b) {
  let cur = b.type
  let displayCur = util.camelCaseToLowerCase(cur)

  if ($('#bulk-selector option[value="' + cur + '"]').length === 0) {
    let option = '<option value="' + cur + '">' + displayCur + '</option>'
    $('#bulk-selector').append(option)
  }
}

bulkView.handleSelector = function() {
  $('#bulk-selector').off('change').on('change', function() {
    let type = $('#bulk-selector').val()
    let curBulk = util.findObjInArray(type, project.current.bulkMaterials.all, 'type')[0]
    bulkView.renderDetails(curBulk.type)
  })
}

bulkView.handleNav = function() {
  $('#bulk-nav > button').off('click').on('click', function() {
    let $curNav = $('#bulk-nav > .button-primary').text()
    let $nextNav = $(this).text()

    if ($curNav != $nextNav) {
      $(this).addClass('button-primary')
        .siblings().removeClass('button-primary')

      if ($nextNav === 'summary') {
        bulkView.renderSummary()
      } else if ($nextNav === 'details') {
        let $type = $('#bulk-selector > option').val()
        bulkView.renderDetails($type)
        bulkView.handleEdit()
        bulkView.handleDelete()
      }

    } else {
      return
    }
  })
}

bulkView.handleEdit = function() {
  $('#bulk-table .icon-pencil2').off('click').on('click', function() {
    let curId = $(this).data('id')
    project.current.bulkMaterials.all.forEach((bm) => {
      if (bm.id === curId) {
        bulkView.populateForm(bm)
        $('#bulk-save').val('update')
      }
    })
  })
}

bulkView.handleDelete = function() {
  $('#bulk-table .icon-bin2').off('click').on('click', function(e) {
    let $curId = $(this).data('id')
    let $curType = $(this).data('type')

    bulkController.delete($curId, $curType)
    bulkView.handleEdit()
    bulkView.handleDelete()
  })
}

bulkView.makeSummary = function(bm) {
  const hours = util.sumStrippedProps(bm.all, ['laborHrs'])
  const uber = bm.uber
  let summary = `<tr><th>Type</th><th>Volume</th><th>Hours</th><th>Price</th><th>Tax</th><th>Total</th></tr>`
  let grandTotal = 0

  for (let prop in uber) {
    if (uber[prop] > 0) {

      let price = util.round('round', util.materialCost(uber[prop], materials.bulk[prop]), 0.01)
      let tax = util.salesTax(price)
      let total = util.round('round', price + tax, 0.01)
      grandTotal += total
      summary += bulkView.makeSummaryRow(prop, uber[prop], price, tax, total)
    }
  }

  summary += `<tr class="total-row"><td>Total</td><td></td><td>${hours}</td><td></td><td></td><td class="money">$${grandTotal.toFixed(2)}</td></tr>`

  return summary
}

bulkView.makeSummaryRow = function(prop, vol, price, tax, total) {
  return `<tr><td>${prop}</td><td>${vol} yd</td><td class="money">$${price.toFixed(2)}</td><td class="money">$${tax.toFixed(2)}</td><td class="money">$${total.toFixed(2)}</td></tr>`
}

bulkView.makeDetails = function(curType) {
  let totals = {
    volume: 0,
    hours: 0,
    price: 0,
    tax: 0,
    total: 0
  }
  let details = `<tr><th>ID</th><th>Type</th><th>Width</th><th>Length</th><th>Depth</th><th>Volume</th><th>Hours</th><th>Price*</th><th>Tax</th><th>Total</th></tr>`
  let filtered = project.current.bulkMaterials.all.filter((bm) => bm.type === curType)

  filtered.map((f) => {
    return details += bulkView.makeRow(f)
  })

  filtered.forEach((e) => {
    totals.hours += e.laborHrs
    totals.volume += e.volume
  })

  totals.volume = util.round('ceil', totals.volume, 0.5)
  totals.price = util.round('round', util.materialCost(totals.volume, materials.bulk[curType]) + util.laborCost(totals.hours), 0.01)
  totals.tax = util.salesTax(totals.price)
  totals.total = util.round('round', totals.price + totals.tax, 0.01)

  details += `
  <tr class="total-row">
  <td>Totals</td>
  <td>${util.camelCaseToLowerCase(curType)}</td>
  <td></td>
  <td></td>
  <td></td>
  <td>${totals.volume} yd</td>
  <td>${totals.hours}</td>
  <td class="money">$${totals.price.toFixed(2)}</td>
  <td class="money">$${totals.tax.toFixed(2)}</td>
  <td class="money">$${totals.total.toFixed(2)}</td>
  </tr>
  `

  return details
}

bulkView.makeRow = function(b) {
  let row = ''
  row += `
  <tr>
  <td>${b.id}</td>
  <td>${util.camelCaseToLowerCase(b.type)}</td>
  <td>${b.widFt}' ${b.widIn}"</td>
  <td>${b.lenFt}' ${b.lenIn}"</td>
  <td>${b.depth}"</td>
  <td>${b.volume} yd</td>
  <td>${b.laborHrs}</td>
  <td></td>
  <td></td>
  <td></td>
  <td><span data-id="${b.id}" class="icon-pencil2"></span></td>
  <td><span data-id="${b.id}" data-type="${b.type}" class="icon-bin2"></span></td>
  </tr>
  `
  return row
}

bulkView.populateForm = function(bm) {
  $('#bulk-id').val(bm.id)
  $('#bulk-type').val(bm.type)
  $('#bulk-width-ft').val(bm.widFt)
  $('#bulk-width-in').val(bm.widIn)
  $('#bulk-length-ft').val(bm.lenFt)
  $('#bulk-length-in').val(bm.lenIn)
  $('#bulk-depth').val(bm.depth)
}

bulkView.clearForm = function() {
  $('#bulk-form input[type="text"]').val('')
  $('#bulk-form input[type="number"]').val('')
}
