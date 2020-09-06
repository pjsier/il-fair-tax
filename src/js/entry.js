import "formdata-polyfill"
import "classlist-polyfill"
import cssVars from "css-vars-ponyfill"
import "./calculator.js"

cssVars({
  preserveVars: true,
  watch: true,
  variables: {
    "--current-tax-pct": "0%",
    "--fair-tax-pct": "0%",
  },
})

function onChange() {
  const currentTaxPct = +document.getElementById("current-tax-bar").dataset
    .percent
  const fairTaxPct = +document.getElementById("fair-tax-bar").dataset.percent
  cssVars({
    preserveVars: true,
    watch: true,
    variables: {
      "--current-tax-pct": `${Math.max(0, currentTaxPct).toFixed(2)}%`,
      "--fair-tax-pct": `${Math.max(0, fairTaxPct).toFixed(2)}%`,
    },
  })
}

document.addEventListener("DOMContentLoaded", () => {
  const calculatorForm = document.querySelector("form[name='calculator']")
  if (!calculatorForm) return

  calculatorForm.addEventListener("change", onChange)
  onChange()
})
