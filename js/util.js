var util = {};

util.ceilingHalf = function(x) {
  return Math.ceil(x * 2) / 2;
}

util.volumeCyl = function(d, h) {                   //takes d in inches, h in layers, returns yards
  return (Math.PI * Math.pow((d / 24), 2) * ((h / 2) + 0.33)) / 27;
}
