const Image = require("@11ty/eleventy-img")
const sitemap = require("@quasibit/eleventy-plugin-sitemap")
const { baseurl, languages } = require("./site/_data/site")

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

  eleventyConfig.addWatchTarget("./src/css")
  eleventyConfig.addWatchTarget("./src/js")

  eleventyConfig.addNunjucksAsyncShortcode("resizeImage", async function (
    src,
    sizes,
    outputFormat = "png"
  ) {
    const stats = await Image(src, {
      widths: [+sizes.split("x")[0]],
      formats: [outputFormat],
      outputDir: "./site/img",
    })

    const props = stats[outputFormat].slice(-1)[0]
    return props.url
  })

  eleventyConfig.addFilter("baseUrl", (value) =>
    value.split("/").slice(2).join("")
  )

  eleventyConfig.addCollection("faqs", (collectionApi) =>
    collectionApi
      .getFilteredByTag("faqs")
      .sort(({ data: { order: a } }, { data: { order: b } }) => a - b)
  )

  eleventyConfig.addCollection("redirects", (collectionApi) =>
    collectionApi.getFilteredByTag("redirect")
  )

  const nonDefaultLanguages = languages
    .filter(({ default: isDefault }) => !isDefault)
    .map(({ value }) => value)

  eleventyConfig.addCollection("sitemap", (collectionApi) =>
    collectionApi
      .getFilteredByTag("redirect")
      .map(({ url, date, data: { t, locale: dataLocale, ...data } }) => {
        const pageLocale = t.locale || dataLocale
        return {
          url,
          date,
          data: {
            ...data,
            t,
            locale: dataLocale,
            sitemap: {
              ...data.sitemap,
              links: nonDefaultLanguages.map((lang) => ({
                url: url.replace(`/${pageLocale}`, `/${lang}`),
                lang,
              })),
            },
          },
        }
      })
  )

  eleventyConfig.addPassthroughCopy({
    "src/img": "img",
    "site/img": "img",
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
