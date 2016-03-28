var bulk = {
  current: {}
}

function bulkMaker (i, t, wf, wi, lf, li, d) {
  this.id = i || ''
  this.type = t || ''
  this.widFt = wf || 0
  this.widIn = wi || 0
  this.lenFt = lf || 0
  this.lenIn = li || 0
  this.depth = d || 0
  this.volume = 0
  this.price = 0
  this.tax = 0
  this.total = 0
}

bulk.build = function() {
  let $id = $('#bulk-id').val()
  let $type = $('#bulk-type').val()
  let $widFt = +($('#bulk-width-ft').val())
  let $widIn = +($('#bulk-width-in').val()) || 0
  let $lenFt = +($('#bulk-length-ft').val())
  let $lenIn = +($('#bulk-length-in').val()) || 0
  let $depth = +($('#bulk-depth').val())
  return new bulkMaker($id, $type, $widFt, $widIn, $lenFt, $lenIn, $depth)
}

bulk.calcs = function(b) {
  let type = materials.bulk[b.type]

  b.volume = util.round('ceil', ((b.widFt * 12 + b.widIn) * (b.lenFt * 12 + b.lenIn) * b.depth) / 46656, 0.1)
  b.price = util.round('round', util.materialCost(b.volume, type), 0.01)
  b.tax = util.salesTax(b.price)
  b.total = util.round('round', b.price + b.tax, 0.01)
}

bulk.saveToProject = function(b) {
  if(user.uid && project.current.client) {
    bulk.storeLocally(b)
    project.current.bulkMaterials.uber = bulk.makeUber(project.current.bulkMaterials.all)
    project.updateComponent(project.current, 'bulkMaterials')
  } else {
    console.log('Either you\'re not signed in or haven\'t initiated a project!')
  }
}

bulk.storeLocally = function(b) {
  let all = project.current.bulkMaterials.all
  let $exists = util.findObjInArray(b.id, all, 'id')

  if ($exists.length) {
    all.forEach((c,i) => {
      if (b.id === c.id) {
        all[i] = b
      }
    })
  } else {
    all.push(b)
  }
  bulk.current = b
}

bulk.makeUber = function(all) {
  let uber = {
    mulch: 0,
    bioretention: 0,
    groCo: 0,
    fillSoil: 0,
    paverbase: 0,
    drainageRock: 0,
    fiveEighthsClean: 0,
    fiveEighthsMinus: 0,
    playChips: 0,
    nugget: 0
  }

  all.forEach((e) => {
    let curType = e.type
    if (uber.hasOwnProperty(curType)) {
      uber[curType] += e.volume
    } else {
      console.log('property ' + curType + ' not found in uber');
    }
  })

  return uber
}

bulk.preventDuplicates = function() {
  let $id = $('#bulk-id').val()
  let $exists = util.findObjInArray($id, project.current.bulkMaterials.all, 'id').length
  if ($exists) {
    return true
  } else {
    return false
  }
}

bulk.listen = function() {
  bulkView.makeTable()
  bulk.updateTotals()
  bulkView.showTotal()
  bulkView.editZone()
  bulkView.deleteZone()
}
