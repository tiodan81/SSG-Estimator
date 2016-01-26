var util = {};

util.ceilingHalf = function(x) {
  return Math.ceil(x * 2) / 2;
}

util.volumeCyl = function(d, h) {
  return (Math.PI(d / 24)^2 * (h / 2 + 0.33)) / 27;
}
