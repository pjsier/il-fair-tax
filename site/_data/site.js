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
  name: "Vote Yes for Fair Tax",
  title: "Vote Yes for Fair Tax",
  type: "website",
  baseurl,
  url: baseurl,
  description: "Learn about how we can make Illinois income taxes more fair",
  environment,
  lang: "en",
  langRoot: "/en/",
  production: environment === "production",
  deployed: ["staging", "production"].includes(environment),
  googleAnalyticsId: "UA-177434997-1",
  languages: [
    {
      value: "en",
      label: "English",
      default: true,
    },
    { value: "es", label: "Español" },
  ],
}
