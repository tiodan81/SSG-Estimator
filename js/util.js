var util = {}

util.round = (op, num, inc) => {
  let x = 1 / inc
  return Math[op](num * x) / x
}

util.laborCost = (hr) => {
  return hr * project.current.laborRate
}

//ADD THE MARKUP TO THIS FUNCTION!
util.materialCost = (qty, rate) => {
  return qty * rate
}

util.salesTax = (price) => {
  return util.round('round', price * 0.095, 0.01)
}

util.findObjInArray = (id, arr, selector) => {
  return $.grep(arr, (e) => {
    return e[selector] == id
  })
}

util.sumObject = (obj) => {
  return Object.keys(obj)
                .reduce((sum, key) => {
                  return sum + obj[key]
                }, 0)
}

//sums all values of key in obj
util.plucky = function (key, obj) {
  var sum = 0
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop) && key === prop) {
      sum += obj[prop]
    } else if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
      sum += util.plucky(key, obj[prop])
    }
  }
  return sum
}

//returns array of objects with desired props
util.objectStripper = function(arr, props) {
  var newarr = []
  arr.forEach(function(e) {
    newarr.push(_.pick(e, props))
  })
  return newarr
}

//returns de-duped array of desired property values from array of objects
util.picker = function(arr, prop) {
  return arr.map((obj) => obj[prop])
            .filter((v, i, a) => a.indexOf(v) == i)
}
