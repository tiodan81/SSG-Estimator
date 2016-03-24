var bulk = {
  zoneId: 0,          //reset to mulchZones.length on first page load
  totalVolume: 0,
  totalPrice: 0,
  mulchZones: [],
  mulchPrices: {
    bark: 10,
    chips: 20,
    GroCo: 30
  }
}

function MulchZone (i, z, t, wf, wi, lf, li, d, p) {
  this.id = i
  this.zone = z
  this.type = t
  this.widFt = wf
  this.widIn = wi
  this.lenFt = lf
  this.lenIn = li
  this.depth = d
  this.dispWidth = this.widFt + "' " + this.widIn + '"'
  this.dispLength = this.lenFt + "' " + this.lenIn + '"'
  this.volume = util.round('round',((wf * 12 + wi) * (lf * 12 + li) * d) / 46656, 0.01)
  this.price = util.round('round', this.volume * p, 0.01)
}

bulk.updateTotals = function() {
  bulk.totalVolume = 0
  bulk.totalPrice = 0
  bulk.mulchZones.forEach(function(e) {
    bulk.totalVolume += e.volume
    bulk.totalPrice += e.price
  })
  $('#mulch-total-vol').text(bulk.totalVolume + ' yd')
  $('#mulch-total-price').text('$' + bulk.totalPrice)
}

bulk.findReplace = function(updated) {
  bulk.mulchZones.forEach(function(zone, i) {
    if (zone.id === updated.id) {
      bulk.mulchZones[i] = updated
    }
  })
}

bulk.buildMulch = function(id) {
  var $zone = $('#bulk-zone').val()
  var $type = $('#bulk-type').val()
  var $widFt = parseInt($('#width-ft').val())
  var $widIn = parseInt($('#width-in').val()) || 0
  var $lenFt = parseInt($('#length-ft').val())
  var $lenIn = parseInt($('#length-in').val()) || 0
  var $depth = parseInt($('#depth').val())
  var curPrice = bulk.mulchPrices[$type]
  return new MulchZone(id, $zone, $type, $widFt, $widIn, $lenFt, $lenIn, $depth, curPrice)
}

bulk.listen = function() {
  bulkView.makeTable()
  bulk.updateTotals()
  bulkView.showTotal()
  bulkView.editZone()
  bulkView.deleteZone()
}
