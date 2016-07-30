'use strict';

const expect = require('chai').expect

const util = require('../js/util')

describe('testing util.round', function() {
  it('should floor 9.99 to 9', function() {
    console.log(util);
    const output = util.round('floor', 9.99, 1)
    expect(output).to.equal(9)
  })

  it('should ceil 9.99 to 10', function() {
    const output = util.round('ceil', 9.99, 1)
    expect(output).to.equal(10)
  })
})

describe('testing util.laborCost', function() {
  it('should return 4 for laborCost(2,2)', function() {
    const output = util.laborCost(2,2)
    expect(output).to.equal(4)
  })
})
