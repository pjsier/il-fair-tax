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
  const root = document.documentElement
  root.style.setProperty("--results-display", income > 0 ? "block" : "none")

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

  root.style.setProperty(
    "--current-tax-pct",
    `${Math.max(0, currentTaxPct).toFixed(2)}%`
  )
  root.style.setProperty(
    "--fair-tax-pct",
    `${Math.max(0, fairTaxPct).toFixed(2)}%`
  )
}

function setupJointFilerToggles(form) {
  const jointFields = [...form.querySelectorAll(`[data-status="joint"]`)]

  const updateFields = (isChecked) =>
    jointFields.map((field) => field.classList.toggle("hidden", isChecked))

  form.querySelectorAll(`input[name="status"]`).forEach((input) => {
    input.addEventListener("change", () =>
      updateFields(input.id !== "statusJoint")
    )
  })

  updateFields(form.querySelector(`#statusJoint:checked`) === null)
}

// Set currency formatting after blur to avoid issues with label masking
function currencyInputListeners(input) {
  input.addEventListener("blur", () => {
    if (input.value.trim()) {
      input.value = currencyStr(+input.value)
    }
  })
  input.addEventListener("focus", () => {
    if (input.value.trim()) {
      input.value = (+input.value.replace(/[^0-9.]/g, "")).toString()
    }
  })
}

function addInputListeners(form) {
  form.querySelectorAll("input").forEach((input) => {
    input.addEventListener("blur", () => {
      input.checkValidity()
    })
    input.addEventListener("change", () => handleForm(form))
    input.addEventListener("input", () => handleForm(form))
    if (input.dataset.type === "currency") {
      currencyInputListeners(input)
    }
  })
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form[name='calculator']")
  if (!form) return
  searchParamsToForm(form)
  form.querySelectorAll("input[data-type='currency']").forEach((input) => {
    if (input.value.trim()) {
      input.value = currencyStr(+input.value.replace(/[^0-9.]/g, ""))
    }
  })
  addInputListeners(form)
  setupJointFilerToggles(form)
  handleForm(form)
})
