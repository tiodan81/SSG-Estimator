const $ = require('jquery')
const _ = require('lodash')
const project = require('./models/project')

const round = (op, num, inc) => {
  let x = 1 / inc
  return Math[op](num * x) / x
}

const laborCost = (hr) => {
  return hr * project.current.laborRate
}

//ADD THE MARKUP TO THIS FUNCTION!
const materialCost = (qty, rate) => {
  return round('round', qty * rate, 0.01)
}

const salesTax = (price) => {
  return round('round', price * 0.095, 0.01)
}

const findObjInArray = (id, arr, selector) => {
  return $.grep(arr, (e) => {
    return e[selector] == id
  })
}

//sum values of all properties in an object
const sumObject = (obj) => {
  return Object.keys(obj)
                .reduce((sum, key) => {
                  return sum + obj[key]
                }, 0)
}

//sums all values of key in obj
const plucky = function (key, obj) {
  let sum = 0
  for (let prop in obj) {
    if (obj.hasOwnProperty(prop) && key === prop) {
      sum += obj[prop]
    } else if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
      sum += plucky(key, obj[prop])
    }
  }
  return sum
}

//returns array of objects with desired props
const objectStripper = function(arr, props) {
  let newarr = []
  arr.forEach(function(e) {
    newarr.push(_.pick(e, props))
  })
  return newarr
}

// returns array of summed values of props from all objects in arr
const sumStrippedProps = function (arr, props) {
  return props.map((prop) => {

    return objectStripper(arr, prop)
      .reduce((sum, obj) => {
        return sum + obj[prop]
      }, 0)

  })
}

//returns de-duped array of desired property values from array of objects
const picker = function(arr, prop) {
  return arr.map((obj) => obj[prop])
            .filter((v, i, a) => a.indexOf(v) == i)
}

const camelCaseToLowerCase = function(str) {
  return str.replace(/([A-Z])/g, ' $1').toLowerCase()
}

module.exports = {
  round: round,
  laborCost: laborCost,
  materialCost: materialCost,
  salesTax: salesTax,
  findObjInArray: findObjInArray,
  sumObject: sumObject,
  plucky: plucky,
  objectStripper: objectStripper,
  sumStrippedProps: sumStrippedProps,
  picker: picker,
  camelCaseToLowerCase: camelCaseToLowerCase
}
