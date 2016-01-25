var cistern = {
  totalPrice: 0,
  cisterns: [],
  tankModels: [
    [

    ]
  ]
};

//"ssgPrice": purchasePrice * mkup + delivery


function cisternMaker () {
  this.id = i;
  this.roofArea = a;
  this.brand = b;
  this.model = m;
  this.baseHeight = h;
  this.gutter = g;
  this.inflow = inf;
  this.outflow = out;
}

cistern.getJSON = function(callback) {
  $.getJSON('/data/cisternModels.json', function(data) {
    console.log(data);
  });
  callback();
};


var cisternView = {};

cisternView.init = function () {
  $('#cistern-content').show()
  .siblings().hide();
};
