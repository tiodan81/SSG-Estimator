var mulch = {
  zoneId: 0,          //reset to mulchZones.length on first page load
  totalVolume: 0,
  totalPrice: 0,
  mulchZones: [],
  mulchPrices: {
    bark: 10,
    chips: 20,
    GroCo: 30
  }
};

function MulchZone (i, z, t, wf, wi, lf, li, d, p) {
  this.id = i;
  this.zone = z;
  this.type = t;
  this.widFt = wf;
  this.widIn = wi;
  this.lenFt = lf;
  this.lenIn = li;
  this.depth = d;
  this.dispWidth = this.widFt + "' " + this.widIn + '"';
  this.dispLength = this.lenFt + "' " + this.lenIn + '"';
  this.volume = util.round('round',((wf * 12 + wi) * (lf * 12 + li) * d) / 46656, 0.01);
  this.price = util.round('round', this.volume * p, 0.01);
}

mulch.updateTotals = function() {
  mulch.totalVolume = 0;
  mulch.totalPrice = 0;
  mulch.mulchZones.forEach(function(e) {
    mulch.totalVolume += e.volume;
    mulch.totalPrice += e.price;
  });
  $('#mulch-total-vol').text(mulch.totalVolume + ' yd');
  $('#mulch-total-price').text('$' + mulch.totalPrice);
};

mulch.findReplace = function(updated) {
  mulch.mulchZones.forEach(function(zone, i) {
    if (zone.id === updated.id) {
      mulch.mulchZones[i] = updated;
    }
  });
};

mulch.buildMulch = function(id) {
  var $zone = $('#zone').val();
  var $type = $('#type').val();
  var $widFt = parseInt($('#width-ft').val());
  var $widIn = parseInt($('#width-in').val()) || 0;
  var $lenFt = parseInt($('#length-ft').val());
  var $lenIn = parseInt($('#length-in').val()) || 0;
  var $depth = parseInt($('#depth').val());
  var curPrice = mulch.mulchPrices[$type];
  return new MulchZone(id, $zone, $type, $widFt, $widIn, $lenFt, $lenIn, $depth, curPrice);
};

mulch.listen = function() {
  mulchView.makeTable();
  mulch.updateTotals();
  mulchView.showTotal();
  mulchView.editZone();
  mulchView.deleteZone();
};
