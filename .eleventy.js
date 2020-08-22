const { baseurl } = require("./site/_data/site")
const sitemap = require("@quasibit/eleventy-plugin-sitemap")

module.exports = function (eleventyConfig) {
  // This allows Eleventy to watch for file changes during local development.
  eleventyConfig.setUseGitIgnore(false)

  eleventyConfig.addCollection("faqs", (collectionApi) =>
    collectionApi
      .getFilteredByTag("faqs")
      .sort(({ data: { order: a } }, { data: { order: b } }) => a - b)
  )

  eleventyConfig.addCollection("sitemap", (collectionApi) =>
    collectionApi
      .getAll()
      .filter(({ url }) => url && !url.includes("404") && !url.includes(".txt"))
  )

  // TODO: target _blank, rel noreferrer on external links

  eleventyConfig.addPassthroughCopy({ "src/img": "img" })

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
