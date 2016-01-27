var util = {};

util.laborCost = function(hr) {
  return hr * project.laborRate;
}

util.round = function(op, num, inc) {
  let x = 1 / inc;
  return Math[op](num * x) / x;
}
