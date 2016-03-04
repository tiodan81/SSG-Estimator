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
