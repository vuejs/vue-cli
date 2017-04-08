module.exports = {
  "metalsmith": {
    before: function (metalsmith, opts, helpers) {
      metalsmith.metadata().before = "Before";
    },
    after: function (metalsmith, opts, helpers) {
      metalsmith.metadata().after  = "After";
      function customMetalsmithPlugin (files, metalsmith, done) {
        // Implement something really custom here.

        var readme = files['readme.md']
        delete files['readme.md']
        files['custom-before-after/readme.md'] = readme

        done(null, files)
      }

      metalsmith.use(customMetalsmithPlugin)
    }
  }
}
