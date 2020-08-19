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
    fairTaxAmount: fairTax,
    currentTaxAmount: currentTax,
    difference,
  })
  formObjToSearchParams(params)
}

function updateResults({ fairTaxAmount, currentTaxAmount, difference }) {
  document.getElementById("fairTaxAmount").innerText = currencyStr(
    fairTaxAmount
  )
  document.getElementById("currentTaxAmount").innerText = currencyStr(
    currentTaxAmount
  )
  document.getElementById("difference").innerText = currencyStr(difference)
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
  searchParamsToForm(form)
  form.querySelectorAll("input[data-type='currency']").forEach((input) => {
    if (input.value.trim()) {
      input.value = currencyStr(+input.value)
    }
  })
  addInputListeners(form)
  setupJointFilerToggles(form)
  handleForm(form)
})
