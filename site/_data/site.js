const ENVIRONMENT_URLS = {
  production: "https://ilfair.tax",
  staging: "https://staging.ilfair.tax",
}

const getEnvironment = (nodeEnv, eleventyEnv) => {
  if (eleventyEnv === "production") return "production"
  if (nodeEnv === "production") return "staging"
  return "development"
}

const environment = getEnvironment(
  process.env.NODE_ENV,
  process.env.ELEVENTY_ENV
)

const baseurl =
  environment in ENVIRONMENT_URLS
    ? ENVIRONMENT_URLS[environment]
    : "http://localhost:8080"

module.exports = {
  name: "IL Fair Tax",
  title: "IL Fair Tax",
  type: "website",
  baseurl,
  url: baseurl,
  description: "IL Fair Tax",
  environment,
  lang: "en",
  langRoot: "/en/",
  languages: [
    {
      value: "en",
      label: "English",
      default: true,
    },
    { value: "es", label: "Español" },
  ],
}
