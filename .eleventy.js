module.exports = function (eleventyConfig) {
  // This allows Eleventy to watch for file changes during local development.
  eleventyConfig.setUseGitIgnore(false)

  eleventyConfig.addCollection("faqs", (collectionApi) =>
    collectionApi
      .getFilteredByTag("faqs")
      .sort(({ data: { order: a } }, { data: { order: b } }) => a - b)
  )

  eleventyConfig.addPassthroughCopy({ "src/img": "img" })

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
