'use strict';

var util = {};

util.round = function (op, num, inc) {
  var x = 1 / inc;
  return Math[op](num * x) / x;
};

util.laborCost = function (hr) {
  return hr * project.current.laborRate;
};

//ADD THE MARKUP TO THIS FUNCTION!
util.materialCost = function (qty, rate) {
  return util.round('round', qty * rate, 0.01);
};

util.salesTax = function (price) {
  return util.round('round', price * 0.095, 0.01);
};

util.findObjInArray = function (id, arr, selector) {
  return $.grep(arr, function (e) {
    return e[selector] == id;
  });
};

//sum values of all properties in an object
util.sumObject = function (obj) {
  return Object.keys(obj).reduce(function (sum, key) {
    return sum + obj[key];
  }, 0);
};

//sums all values of key in obj
util.plucky = function (key, obj) {
  var sum = 0;
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop) && key === prop) {
      sum += obj[prop];
    } else if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
      sum += util.plucky(key, obj[prop]);
    }
  }
  return sum;
};

//returns array of objects with desired props
util.objectStripper = function (arr, props) {
  var newarr = [];
  arr.forEach(function (e) {
    newarr.push(_.pick(e, props));
  });
  return newarr;
};

// returns array of summed values of props from all objects in arr
util.sumStrippedProps = function (arr, props) {
  return props.map(function (prop) {

    return util.objectStripper(arr, prop).reduce(function (sum, obj) {
      return sum + obj[prop];
    }, 0);
  });
};

//returns de-duped array of desired property values from array of objects
util.picker = function (arr, prop) {
  return arr.map(function (obj) {
    return obj[prop];
  }).filter(function (v, i, a) {
    return a.indexOf(v) == i;
  });
};

util.camelCaseToLowerCase = function (str) {
  return str.replace(/([A-Z])/g, ' $1').toLowerCase();
};