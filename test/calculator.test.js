const fs = require("fs")
const { expect } = require("chai")
const { calculateCurrentTax, calculateFairTax } = require("../src/js/calculate")

describe("calculator", function () {
  it("should match test output", function () {
    const fixtures = JSON.parse(
      fs.readFileSync(`${__dirname}/fixtures/test-data.json`)
    )
    for (const { outputDiff, ...params } of fixtures) {
      const currentTax = Math.round(calculateCurrentTax(params))
      const fairTax = Math.round(calculateFairTax(params))
      const difference = fairTax - currentTax
      const diffRange = [-2, -1, 0, 1, 2]
      if (!diffRange.map((diff) => difference + diff).includes(outputDiff)) {
        console.log(params)
      }
      // Off by one or two errors are alright because of rounding
      expect(diffRange.map((diff) => difference + diff)).to.include(outputDiff)
    }
  })
})
