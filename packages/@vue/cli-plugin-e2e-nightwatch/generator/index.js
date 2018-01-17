module.exports = api => {
  api.render('./template', {
    hasTS: api.hasPlugin('typescript')
  })

  api.extendPackage({
    scripts: {
      e2e: 'vue-cli-service e2e'
    }
  })
}
