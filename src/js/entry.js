import "formdata-polyfill"
import cssVars from "css-vars-ponyfill"
import "./index.js"
import "./calculator.js"

cssVars({
  preserveVars: true,
  watch: true,
  variables: {
    "--results-display": "none",
    "--current-tax-pct": "0%",
    "--fair-tax-pct": "0%",
  },
})

function onChange() {
  const { income, currentTaxPct, fairTaxPct } = window.formProps
  cssVars({
    preserveVars: true,
    watch: true,
    variables: {
      "--results-display": income >= 0 ? "block" : "none",
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
