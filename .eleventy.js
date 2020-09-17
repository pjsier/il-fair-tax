const Image = require("@11ty/eleventy-img")
const sitemap = require("@quasibit/eleventy-plugin-sitemap")
const { baseurl, languages } = require("./site/_data/site")

module.exports = function (eleventyConfig) {
  eleventyConfig.setBrowserSyncConfig({ open: true })

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

  eleventyConfig.addFilter("markdown", (value) => markdownLib.render(value))

  eleventyConfig.addFilter("baseUrl", (value) =>
    value.split("/").slice(2).join("")
  )

  eleventyConfig.addCollection("faqs", (collectionApi) =>
    collectionApi
      .getFilteredByTag("faqs")
      .filter(({ data: { hide } }) => !hide) // Ignore items if the "hide" key is enabled
      .sort(({ data: { order: a } }, { data: { order: b } }) => a - b)
  )

  eleventyConfig.addCollection("redirects", (collectionApi) =>
    collectionApi.getFilteredByTag("redirect")
  )

  // Create a collection of items without permalinks so that we can reference them
  // in a separate shortcode to pull in partial content directly
  eleventyConfig.addCollection("partials", (collectionApi) =>
    collectionApi.getAll().filter(({ data: { permalink } }) => !permalink)
  )

  eleventyConfig.addNunjucksShortcode("localecontent", function (
    collection,
    locale,
    rawFileSlug
  ) {
    const fileSlug = rawFileSlug.toString()
    const content = collection.find(
      ({ data: { locale: contentLocale }, fileSlug: contentFileSlug }) =>
        locale === contentLocale && fileSlug === contentFileSlug
    )
    return content ? content.templateContent : ``
  })

  const nonDefaultLanguages = languages
    .filter(({ default: isDefault }) => !isDefault)
    .map(({ value }) => value)

  // TODO: Reenable when translations are ready
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
              links: [],
              // links: nonDefaultLanguages.map((lang) => ({
              //   url: url.replace(`/${pageLocale}`, `/${lang}`),
              //   lang,
              // })),
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
