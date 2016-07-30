'use strict'

module.exports = {
  round: (op, num, inc) => {
    let x = 1 / inc
    return Math[op](num * x) / x
  },

  laborCost: (hr) => {
    return hr * project.current.laborRate
  },

  //ADD THE MARKUP TO THIS FUNCTION!
  materialCost: (qty, rate) => {
    return this.round('round', qty * rate, 0.01)
  },

  salesTax: (price) => {
    return this.round('round', price * 0.095, 0.01)
  },

  findObjInArray: (id, arr, selector) => {
    return $.grep(arr, (e) => {
      return e[selector] == id
    })
  },

  //sum values of all properties in an object
  sumObject: (obj) => {
    return Object.keys(obj)
                  .reduce((sum, key) => {
                    return sum + obj[key]
                  }, 0)
  },

  //sums all values of key in obj
  plucky: function (key, obj) {
    let sum = 0
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop) && key === prop) {
        sum += obj[prop]
      } else if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
        sum += this.plucky(key, obj[prop])
      }
    }
    return sum
  },

  //returns array of objects with desired props
  objectStripper: function(arr, props) {
    return arr.map(function(e) {
      return _.pick(e, props)
    })
  },

  // returns array of summed values of props from all objects in arr
  sumStrippedProps: function (arr, props) {
    return props.map((prop) => {

      return this.objectStripper(arr, prop)
        .reduce((sum, obj) => {
          return sum + obj[prop]
        }, 0)

    })
  },

  //returns de-duped array of desired property values from array of objects
  picker: function(arr, prop) {
    return arr.map((obj) => obj[prop])
              .filter((v, i, a) => a.indexOf(v) == i)
  },

  camelCaseToLowerCase: function(str) {
    return str.replace(/([A-Z])/g, ' $1').toLowerCase()
  }
}
