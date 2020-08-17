import { calculateCurrentTax, calculateFairTax } from "./calculate"

function searchParamsToForm(form) {
  const searchParams = new URLSearchParams(window.location.search)

  for (let [key, value] of searchParams.entries()) {
    const input = form.elements[key]
    if (input.type === "checkbox") {
      input.checked = !!value
    } else {
      input.value = value
    }
  }
}

function formObjToSearchParams(formObj) {
  const params = new URLSearchParams({
    ...Object.fromEntries(Object.entries(formObj).filter((entry) => entry[1])),
  })
  window.history.replaceState(
    {},
    window.document.title,
    `${window.location.protocol}//${window.location.host}${
      window.location.pathname
    }${params.toString() === `` ? `` : `?${params}`}`
  )
}

function formToObj(form) {
  const formObj = {}
  const formNames = [
    ...new Set(
      Object.values(form.elements)
        .map((input) =>
          (input instanceof NodeList ? input[0] : input).getAttribute("name")
        )
        .filter((name) => !!name)
    ),
  ]
  const formData = new FormData(form)

  formNames.map((name) => {
    let value = formData.get(name)
    if (form.elements[name].type === "checkbox") {
      value = !!value
    } else if (name !== "status") {
      value = +value
    }
    formObj[name] = value
  })
  return formObj
}

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
  document.getElementById(
    "fairTaxAmount"
  ).innerText = fairTaxAmount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
  document.getElementById(
    "currentTaxAmount"
  ).innerText = currentTaxAmount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
  document.getElementById("difference").innerText = difference.toLocaleString(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    }
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

function addInputListeners(form) {
  form.querySelectorAll("input").forEach((input) => {
    input.addEventListener("blur", () => input.checkValidity())
    input.addEventListener("change", () => handleForm(form))
    input.addEventListener("input", () => handleForm(form))
  })
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form[name='calculator']")
  searchParamsToForm(form)
  addInputListeners(form)
  setupJointFilerToggles(form)
  handleForm(form)
})
