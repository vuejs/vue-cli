module.exports = class CorsPlugin {
  constructor ({ crossorigin, integrity }) {
    this.crossorigin = crossorigin || (integrity ? '' : undefined)
    this.integrity = integrity
  }

  apply (compiler) {
    const ID = `vue-cli-cors-plugin`
    compiler.hooks.compilation.tap(ID, compilation => {
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tap(ID, data => {
        if (this.crossorigin != null) {
          [...data.head, ...data.body].forEach(tag => {
            if (tag.tagName === 'script' || tag.tagName === 'link') {
              tag.attributes.crossorigin = this.crossorigin
            }
          })
        }
      })
    })
  }
}
