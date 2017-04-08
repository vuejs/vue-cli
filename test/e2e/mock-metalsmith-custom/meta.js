module.exports = {
  "metalsmith": function (metalsmith, opts, helpers) {
    metalsmith.metadata().custom = "Custom";
    function customMetalsmithPlugin (files, metalsmith, done) {
      // Implement something really custom here.

      var readme = files['readme.md']
      delete files['readme.md']
      files['custom/readme.md'] = readme

      done(null, files)
    }

    metalsmith.use(customMetalsmithPlugin)
  }
}
