var cistern = {
  cisternIndex: 0,
  totalPrice: 0,
  cisterns: [],
  tankModels: []
};

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
  this.paverbase = 0;
  this.stoneType = '';
  this.stones = 0;
}

function Tank (props) {
  Object.keys(props).forEach(function(e) {
    this[e] = props[e];
  }, this);
};

cistern.getJSON = function(callback) {
  $.getJSON('/data/cisternModels.json', function(data) {
    cistern.tankModels = data;
  });
  if (!bulkMaterials) {
    $.getJSON('/data/bulkMaterials.json', function(data) {
      bulkMaterials = data;
    });
  }
  callback();
};

cistern.buildCistern = function(index) {
  var $id = $('#cistern').val();
  var $ra = +($('#roofArea').val());
  var $m = $('#cisternModel').val();
  var $bh = +($('#cisternBase').val());
  var $g = +($('#gutterFt').val());
  var $inf = +($('#cisternInflow').val());
  var $out = +($('#cisternOutflow').val());
  return new cisternMaker(index, $id, $ra, $m, $bh, $g, $inf, $out);
}

cistern.tankSalePrice = function (tank) {
  return Math.ceil(tank.purchasePrice * project.markup + tank.delivery);
}

cistern.volumeCyl = function(d, h) {
  return (Math.PI * Math.pow((d / 24), 2) * ((h / 2) + 0.33)) / 27;
}

cistern.volumeRect = function(w, d, h) {
  return w * d * h / 5832;
}

cistern.getManorStones = function (d, h) {
  return Math.ceil(Math.PI * d / 16) * h;
}

cistern.getCinderBlocks = function(l, h) {
  return Math.ceil(l / 16) * 3 * h;
}

var cisternView = {};

cisternView.handleNew = function() {
  $('#cistern-add').on('click', function(e) {
    e.preventDefault();
    let newCistern = cistern.buildCistern(cistern.cisternIndex);
    cistern.cisterns.push(newCistern);
    let modelInfo = cistern.tankModels[newCistern.model];
    console.log(modelInfo);
    newCistern.salePrice = cistern.tankSalePrice(modelInfo);
    if (modelInfo.slimline) {
      console.log('slim');
      newCistern.paverbase = util.ceilingHalf(cistern.volumeRect(modelInfo.width, modelInfo.depth, newCistern.baseHeight));
      newCistern.stoneType = 'cinder-block';
      newCistern.stones = cistern.getCinderBlocks(modelInfo.width, newCistern.baseHeight);
    } else {
      console.log('round');
      newCistern.paverbase = util.ceilingHalf(cistern.volumeCyl(modelInfo.diameter, newCistern.baseHeight));
      newCistern.stoneType = 'manor-stone';
      newCistern.stones = cistern.getManorStones(modelInfo.diameter, newCistern.baseHeight);
    }
    cistern.cisternIndex += 1;
    viewUtil.clearForm();
  })
}

cisternView.init = function () {
  $('#cistern-content').show()
  .siblings().hide();
  cisternView.handleNew();
};
