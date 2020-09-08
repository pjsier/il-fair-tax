import { calculateCurrentTax, calculateFairTax } from "./calculate"
import {
  searchParamsToForm,
  formObjToSearchParams,
  formToObj,
  currencyStr,
} from "./utils"

function handleForm(form) {
  const params = formToObj(form)

  const currentTax = calculateCurrentTax(params)
  const fairTax = calculateFairTax(params)
  const difference = fairTax - currentTax

  updateResults({
    income: params.income,
    fairTaxAmount: fairTax,
    currentTaxAmount: currentTax,
    difference,
  })
  formObjToSearchParams(params)
}

function updateResults({
  income,
  fairTaxAmount,
  currentTaxAmount,
  difference,
}) {
  const results = document.getElementById("calculator-results")
  results.classList.toggle("hidden", income <= 0)

  const changeDescription = document.getElementById("change-description")
  // Update description text with current amount
  document
    .querySelectorAll(`[data-template="tax-change-amount"]`)
    .forEach((el) => {
      el.innerText = currencyStr(Math.abs(Math.round(difference)))
    })

  if (difference > 0) {
    changeDescription.innerText = document.getElementById(
      "tax-change-up"
    ).innerText
  } else if (difference < 0) {
    changeDescription.innerText = document.getElementById(
      "tax-change-down"
    ).innerText
  } else {
    changeDescription.innerText = document.getElementById(
      "tax-change-same"
    ).innerText
  }

  document.getElementById("fairTaxAmount").innerText = currencyStr(
    fairTaxAmount
  )
  document.getElementById("currentTaxAmount").innerText = currencyStr(
    currentTaxAmount
  )

  const fairTaxPct = (fairTaxAmount / income) * 100
  const currentTaxPct = (currentTaxAmount / income) * 100

  document.getElementById(
    "current-tax-bar"
  ).dataset.percent = currentTaxPct.toFixed(2)
  document.getElementById("fair-tax-bar").dataset.percent = fairTaxPct.toFixed(
    2
  )

  const root = document.documentElement
  root.style.setProperty(
    "--current-tax-pct",
    `${Math.max(0, currentTaxPct).toFixed(2)}%`
  )
  root.style.setProperty(
    "--fair-tax-pct",
    `${Math.max(0, fairTaxPct).toFixed(2)}%`
  )
}

// Make sure the number of dependents is at least the number of dependents under 17
function updateDependentsFromUnder17() {
  const numDependentsUnder17El = document.getElementById("numDependentsUnder17")
  const numDependentsEl = document.getElementById("numDependents")
  if (+numDependentsEl.value < +numDependentsUnder17El.value) {
    numDependentsEl.value = numDependentsUnder17El.value
  }
}

// Set currency formatting after blur to avoid issues with label masking
function onCurrencyBlur(input) {
  if (input.value.trim()) {
    input.value = currencyStr(+input.value.replace(/[^0-9.]/g, ""))
  }
}

// Remove currency formatting on focus
function onCurrencyFocus(input) {
  if (input.value.trim()) {
    input.value = (+input.value.replace(/[^0-9.]/g, "")).toString()
  }
}

function setupJointFilerToggles(form) {
  const jointFields = [...form.querySelectorAll(`[data-status="joint"]`)]

  const updateFields = (isChecked) => {
    jointFields.map((field) => field.classList.toggle("hidden", isChecked))
    handleForm(form)
  }

  form.querySelectorAll(`input[name="status"]`).forEach((input) => {
    input.addEventListener("change", () =>
      updateFields(input.id !== "statusJoint")
    )
  })

  updateFields(form.querySelector(`#statusJoint:checked`) === null)
}

function addInputListeners(form) {
  setupJointFilerToggles(form)

  form.querySelectorAll(`input:not([name="status"]`).forEach((input) => {
    input.addEventListener("blur", () => {
      input.checkValidity()
      if (input.dataset.type === "currency") {
        onCurrencyBlur(input)
      }
      // Update dependents based on number under 17
      if (input.name === "numDependents") {
        updateDependentsFromUnder17()
        handleForm(form)
      }
    })
    if (input.dataset.type === "currency") {
      input.addEventListener("focus", () => onCurrencyFocus(input))
    }
    input.addEventListener("change", () => handleForm(form))
    input.addEventListener("input", () => {
      if (input.name === "numDependentsUnder17") {
        // Update the number of dependents before calculating
        updateDependentsFromUnder17()
      }
      handleForm(form)
    })
  })
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form[name='calculator']")
  if (!form) return
  searchParamsToForm(form)
  form.querySelectorAll("input[data-type='currency']").forEach(onCurrencyBlur)
  addInputListeners(form)
  handleForm(form)
})
