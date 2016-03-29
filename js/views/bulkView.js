var bulkView = {}

bulkView.init = function() {
  $('#bulk-content').show()
    .siblings().hide()
  bulkView.displayExisting()
  bulkView.handleSave()
  bulkView.handleNav()
  bulkView.handleSelector()
  //bulkView.handleUpdate()
}

bulkView.displayExisting = function() {
  let $existing = project.current.bulkMaterials
  console.log($existing);
  if ($existing.all.length) {
    $('#bulk-selector').empty()
    $existing.all.forEach((e) => {
      bulkView.populateSelector(e)
    })
    bulk.current = $existing.all[0]  //do we even need bulk.current?
    bulkView.renderDetails(bulk.current)
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
      let curId = parseInt($(this).data('id'))
      let updated = mulch.buildMulch(curId)
      mulch.findReplace(updated)
      mulch.listen()
      bulkView.clearForm()
      $val = 'save'
    } else {
      console.log('error: no mulch match.')
    }
  })
}

bulkView.renderDetails = function(b) {
  bulkView.populateSelector(b)
  $('#bulk-selector').val(b.id)
  bulkView.makeTables(b, project.current.bulkMaterials)
  if ($('#bulk-display').css('display') === 'none') {
    $('#bulk-table-summary').hide()
    $('#bulk-display').show()
  }
}

bulkView.populateSelector = function(b) {
  let cur = b.type
  if ($('#bulk-selector option[value="' + cur + '"]').length === 0) {
    let option = '<option value="' + cur + '">' + cur + '</option>'
    $('#bulk-selector').append(option)
  }
}

bulkView.showSummary = function() {
  let $selected = $('#bulk-nav .button-primary').attr('id')
  if ($selected != 'summary') {
    $('#rg-nav > #summary').addClass('button-primary')
    .siblings().removeClass('button-primary')
    $('#bulk-summary').show()
    .siblings().hide()
  }
}

bulkView.handleSelector = function() {
  $('#bulk-selector').off('change').on('change', function() {
    let type = $('#bulk-selector').val()
    let curBulk = util.findObjInArray(type, project.current.bulkMaterials.all, 'type')[0]
    bulkView.makeTables(curBulk)
    bulk.current = curBulk
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
        $('#bulk-selector').hide()
      } else if ($nextNav === 'details') {
        $('#bulk-selector').show()
      }

      let target = '#bulk-table-' + $nextNav
      $(target).show()
        .siblings().hide()

    } else {
      return
    }
  })
}

bulkView.makeTables = function(b, all) {
  $('#bulk-table-details').html(bulkView.makeDetails(b))
  $('#bulk-table-summary').html(bulkView.makeSummary(all))
}

bulkView.makeSummary = function(bm) {
  let uber = bm.uber
  let summary = `<tr><th>Type</th><th>Volume</th><th>Price</th><th>Tax</th><th>Total</th></tr>`
  let grandTotal = util.objectStripper(bm.all, 'total')
                    .reduce((sum, obj) => {
                      return sum + obj.total
                    }, 0)

  for (let prop in uber) {
    if (uber[prop] > 0) {
      summary += bulkView.makeSummaryRow(prop, uber[prop])
    }
  }

  summary += `<tr><td>Total</td><td></td><td></td><td></td><td>$${grandTotal}</td></tr>`

  return summary
}

bulkView.makeSummaryRow = function(prop, vol) {
  let price = util.round('round', util.materialCost(vol, materials.bulk[prop]), 0.01)
  let tax = util.salesTax(price)
  let total = util.round('round', price + tax, 0.01)

  return `<tr><td>${prop}</td><td>${vol} yd</td><td>$${price}</td><td>$${tax}</td><td>$${total}</td></tr>`
}

bulkView.makeDetails = function(b) {
  let totals = {
    volume: 0,
    price: 0,
    tax: 0,
    total: 0
  }
  let details = `<tr><th>ID</th><th>Type</th><th>Width</th><th>Length</th><th>Depth</th><th>Volume</th><th>Price</th><th>Tax</th><th>Total</th></tr>`
  let filtered = project.current.bulkMaterials.all.filter((bm) => bm.type === b.type)

  filtered.map((f) => {
    return details += bulkView.makeRow(f)
  })

  filtered.forEach((e) => {
    totals.volume += e.volume
    totals.price += e.price
    totals.tax += e.tax
    totals.total += e.total
  })

  details += `<tr><td>Totals</td><td>${b.type}</td><td></td><td></td><td></td><td>${totals.volume} yd</td><td>$${totals.price}</td><td>$${totals.tax}</td><td>$${totals.total}</td></tr>`

  return details
}

bulkView.makeRow = function(b) {
  let row = ''
  row += `
  <tr>
  <td>${b.id}</td>
  <td>${b.type}</td>
  <td>${b.widFt}' ${b.widIn}"</td>
  <td>${b.lenFt}' ${b.lenIn}"</td>
  <td>${b.depth}"</td>
  <td>${b.volume} yd</td>
  <td>$${b.price}</td>
  <td>$${b.tax}</td>
  <td>$${b.total}</td>
  <td><span id="${b.id}" class="icon-pencil2"></span></td>
  <td><span id="${b.id}" class="icon-bin2"></span></td>
  </tr>
  `
  return row
}

bulkView.populateForm = function(zone) {
  $('#bulk-id').val(zone.id)
  $('#bulk-type').val(zone.type)
  $('#width-ft').val(zone.widFt)
  $('#width-in').val(zone.widIn)
  $('#length-ft').val(zone.lenFt)
  $('#length-in').val(zone.lenIn)
  $('#depth').val(zone.depth)
}

bulkView.clearForm = function() {
  $('#bulk-form input[type="text"]').val('')
  $('#bulk-form input[type="number"]').val('')
}

// bulkView.handleUpdate = function() {
//   $('#mulch-update').off('submit').on('submit', function(e) {
//     e.preventDefault();
//     var curId = parseInt($(this).data('id'));
//     var updated = mulch.buildMulch(curId);
//     mulch.findReplace(updated);
//     mulch.listen();
//     bulkView.clearForm();
//     $('#mulch-update').hide();
//     $('#mulch-add').show();
//   });
// };

// bulkView.editZone = function() {
//   $('#mulch-table-body .icon-pencil2').off('click').on('click', function() {
//     var curId = $(this).attr('id')
//     mulch.mulchZones.forEach(function(zone) {
//       if (zone.id === parseInt(curId)) {
//         bulkView.populateForm(zone)
//         $('mulch-save').val('update').data('id', curId)
//         //$('#mulch-update').show().data('id', curId)
//       }
//     })
//   })
// }
//
// bulkView.deleteZone = function() {
//   $('#mulch-table-body .icon-bin2').off('click').on('click', function(e) {
//     e.preventDefault()
//     var curId = parseInt($(this).attr('id'))
//     mulch.mulchZones.forEach(function(zone, i) {
//       if (zone.id === curId) {
//         mulch.mulchZones.splice(i, 1)
//       }
//     })
//     mulch.listen()
//   })
// }
