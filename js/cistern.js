var cistern = {
  cisternIndex: 0,
  totalPrice: 0,
  cisterns: [],
  tankModels: []
};


//"ssgPrice": purchasePrice * mkup + delivery


function cisternMaker (i, ci, a, m, h, g, inf, out) {
  this.index = i;
  this.cisternId = ci;
  this.roofArea = a;
  this.model = m;
  this.baseHeight = h;
  this.gutter = g;
  this.inflow = inf;
  this.outflow = out;
  this.salePrice = 0;
  this.gravel = 0;
}

function Tank (props) {
  Object.keys(props).forEach(function(e) {
    this[e] = props[e];
  }, this);
};

cistern.getJSON = function(callback) {
  $.getJSON('/data/cisternModels.json', function(data) {
    // for (var tank in data) {
    //   var curTank = new Tank(data[tank]);
    //   cistern.tankModels.push(curTank);
    // }
    cistern.tankModels = data;
  });
  callback();
};

cistern.buildCistern = function(index) {
  var $id = $('#cistern').val();
  var $ra = parseInt($('#roofArea').val());
  var $m = $('#cisternModel').val();
  var $bh = parseInt($('#cisternBase').val());
  var $g = parseInt($('#gutterFt').val());
  var $inf = parseInt($('#cisternInflow').val());
  var $out = parseInt($('#cisternOutflow').val());
  return new cisternMaker(index, $id, $ra, $m, $bh, $g, $inf, $out);
}

cistern.getSalePrice = function (tank) {
  return Math.ceil(tank.purchasePrice * project.markup + tank.delivery);
}

var cisternView = {};

cisternView.handleNew = function() {
  $('#cistern-add').on('click', function(e) {
    e.preventDefault();
    let newCistern = cistern.buildCistern(cistern.cisternIndex);
    cistern.cisterns.push(newCistern);
    let modelInfo = cistern.tankModels[newCistern.model];
    newCistern.salePrice = cistern.getSalePrice(modelInfo);
    newCistern.gravel = util.ceilingHalf(util.volumeCyl(modelInfo.diameter, newCistern.baseHeight));
    cistern.cisternIndex += 1;
    viewUtil.clearForm();
  })
}

cisternView.init = function () {
  $('#cistern-content').show()
  .siblings().hide();
  cisternView.handleNew();
};
