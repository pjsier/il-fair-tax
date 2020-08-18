export function searchParamsToForm(form) {
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

export function formObjToSearchParams(formObj) {
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

export function formToObj(form) {
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

export function currencyStr(amount) {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" })
}