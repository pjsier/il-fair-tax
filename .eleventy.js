module.exports = function (eleventyConfig) {
  // This allows Eleventy to watch for file changes during local development.
  eleventyConfig.setUseGitIgnore(false)

  return {
    dir: {
      input: "src/",
      output: "dist",
      includes: "_includes",
      layouts: "_layouts",
    },
    templateFormats: ["html", "md", "njk"],
    htmlTemplateEngine: "njk",
    passthroughFileCopy: true,
  }
}
