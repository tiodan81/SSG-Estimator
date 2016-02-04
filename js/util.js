var util = {};

util.round = function(op, num, inc) {
  let x = 1 / inc;
  return Math[op](num * x) / x;
};

util.laborCost = function(hr) {
  return hr * project.laborRate;
};

util.materialCost = function(qty, rate) {
  return qty * rate;
};

util.salesTax = function(price) {
  return util.round('round', price * 0.095, 0.01);
};
