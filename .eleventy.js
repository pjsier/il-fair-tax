const sitemap = require("@quasibit/eleventy-plugin-sitemap")
const { baseurl } = require("./site/_data/site")

module.exports = function (eleventyConfig) {
  const markdownIt = require("markdown-it")
  const markdownItLinkAttributes = require("markdown-it-link-attributes")

  // Set target="_blank" and rel="noopener noreferrer" on external links
  const markdownLib = markdownIt({
    html: true,
  }).use(markdownItLinkAttributes, {
    pattern: /^https?:/,
    attrs: {
      target: "_blank",
      rel: "noopener noreferrer",
    },
  })
  eleventyConfig.setLibrary("md", markdownLib)

  // This allows Eleventy to watch for file changes during local development.
  eleventyConfig.setUseGitIgnore(false)

  eleventyConfig.addFilter("baseUrl", (value) =>
    value.split("/").slice(2).join("")
  )

  eleventyConfig.addCollection("faqs", (collectionApi) =>
    collectionApi
      .getFilteredByTag("faqs")
      .sort(({ data: { order: a } }, { data: { order: b } }) => a - b)
  )

  eleventyConfig.addCollection("sitemap", (collectionApi) =>
    collectionApi
      .getAll()
      .filter(({ url }) => url)
      .map(({ url, date, data }, index, all) => ({
        url,
        date,
        data: {
          ...data,
          sitemap: {
            ...data.sitemap,
            links: all
              .filter(
                ({ url: pageUrl, data: { locale: pageLocale } }) =>
                  pageUrl.replace(`/${pageLocale}`, ``) ===
                    url.replace(`/${data.locale}`, ``) && pageUrl !== url
              )
              .map(({ url, data: { locale: lang } }) => ({ url, lang })),
          },
        },
      }))
      .filter(({ data: { locale, site } }) => locale === site.lang)
  )

  eleventyConfig.addPassthroughCopy({
    "src/img": "img",
  })

  eleventyConfig.addPlugin(sitemap, {
    sitemap: {
      hostname: baseurl,
    },
  })

  return {
    dir: {
      input: "site/",
      output: "dist",
      includes: "_includes",
      layouts: "_layouts",
    },
    templateFormats: ["html", "md", "njk"],
    htmlTemplateEngine: "njk",
    passthroughFileCopy: true,
  }
}
