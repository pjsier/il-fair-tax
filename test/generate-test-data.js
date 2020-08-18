const fs = require("fs")
const puppeteer = require("puppeteer")

const randomTestInput = () => ({
  txtAGI: Math.round(Math.random() * 2000000),
  ddlstatus: ["2225", "4450"][Math.round(Math.random() * 1)],
  ddlsixtyfiveplus: ["0", "1000"][Math.round(Math.random() * 1)],
  ddlspousesixtyfiveplus: ["0", "1000"][Math.round(Math.random() * 1)],
  ddllegallyblind: ["0", "1000"][Math.round(Math.random() * 1)],
  ddlspouselegallyblind: ["0", "1000"][Math.round(Math.random() * 1)],
  txtdependents: Math.round(Math.random() * 10),
  txtdependentsunder18: Math.round(Math.random() * 10),
  txtpropertytaxes: Math.round(Math.random() * 25000),
  txteducationexpenses: Math.round(Math.random() * 1000),
})

const generateTestOutput = async (page) => {
  const {
    txtAGI,
    ddlstatus,
    ddlsixtyfiveplus,
    ddlspousesixtyfiveplus,
    ddllegallyblind,
    ddlspouselegallyblind,
    txtdependents,
    txtdependentsunder18,
    txtpropertytaxes,
    txteducationexpenses,
  } = randomTestInput()
  await Promise.all([
    page.$eval("#txtAGI", (el, txtAGI) => (el.value = +txtAGI), txtAGI),
    page.select(`#ddlstatus`, ddlstatus),
    page.select(`#ddlsixtyfiveplus`, ddlsixtyfiveplus),
    page.select(`#ddlspousesixtyfiveplus`, ddlspousesixtyfiveplus),
    page.select(`#ddllegallyblind`, ddllegallyblind),
    page.select(`#ddlspouselegallyblind`, ddlspouselegallyblind),
    page.$eval(
      `#txtdependents`,
      (el, txtdependents) => (el.value = txtdependents),
      txtdependents
    ),
    page.$eval(
      `#txtdependentsunder18`,
      (el, txtdependents, txtdependentsunder18) =>
        (el.value = Math.min(txtdependentsunder18, txtdependents)),
      txtdependents,
      txtdependentsunder18
    ),
    page.$eval(
      `#txtpropertytaxes`,
      (el, txtpropertytaxes) => (el.value = txtpropertytaxes),
      txtpropertytaxes
    ),
    page.$eval(
      `#txteducationexpenses`,
      (el, txteducationexpenses) => (el.value = txteducationexpenses),
      txteducationexpenses
    ),
  ])
  await page.click(`.form-group .btn-primary`)
  const outputText = await page.$eval(
    `#outputstatementresult`,
    (el) => el.innerText
  )
  const outputAmountMatch = outputText.match(/\$\d+/g)
  const outputDiff = outputText.includes("same")
    ? 0
    : +outputAmountMatch[0].replace("$", "") *
      (outputText.includes("decrease") ? -1 : 1)

  return {
    income: txtAGI,
    status: ddlstatus === "2225" ? "single" : "joint",
    older65: ddlsixtyfiveplus === "1000",
    spouseOlder65: ddlspousesixtyfiveplus === "1000",
    legallyBlind: ddllegallyblind === "1000",
    spouseLegallyBlind: ddlspouselegallyblind === "1000",
    numDependents: txtdependents,
    numDependentsUnder17: Math.min(txtdependents, txtdependentsunder18),
    propertyTaxes: txtpropertytaxes,
    k12Expenses: txteducationexpenses,
    outputDiff,
  }
}

const generateTestData = async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(
    "https://www2.illinois.gov/sites/gov/fairtax/Pages/default.aspx"
  )

  let outputs = []
  for (let i = 0; i < 50; ++i) {
    outputs.push(await generateTestOutput(page))
  }

  fs.writeFileSync(
    `${__dirname}/fixtures/test-data.json`,
    JSON.stringify(outputs)
  )

  await browser.close()
}

generateTestData()
