module.exports = function (eleventyConfig) {
  const slugifyId = (s) =>
    String(s)
      .trim()
      .toLowerCase()
      .replace(/[^a-z ]/g, "")
      .replace(/\s/g, "-")

  eleventyConfig.setLibrary(
    "md",
    require("markdown-it")().use(require("markdown-it-anchor"), {
      slugify: slugifyId,
    })
  )

  // This allows Eleventy to watch for file changes during local development.
  eleventyConfig.setUseGitIgnore(false)

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
