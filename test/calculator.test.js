import fs from "fs"
import test from "ava"
import { calculateCurrentTax, calculateFairTax } from "../src/js/calculate"

test("calculator matches test output", (t) => {
  const fixtures = JSON.parse(
    fs.readFileSync(`${__dirname}/fixtures/test-data.json`)
  )
  for (const { outputDiff, ...params } of fixtures) {
    const currentTax = Math.round(calculateCurrentTax(params))
    const fairTax = Math.round(calculateFairTax(params))
    const difference = fairTax - currentTax
    const diffRange = [-1, 0, 1]
    if (!diffRange.map((diff) => difference + diff).includes(outputDiff)) {
      console.log(params)
    }
    // Off by one errors are alright because of slightly different EIC calculation
    // and rounding on the state's site
    t.true(diffRange.map((diff) => difference + diff).includes(outputDiff))
  }
})
