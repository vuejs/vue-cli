const fs = require('fs-extra')
const path = require('path')

// https://gist.github.com/samthor/64b114e4a4f539915a95b91ffd340acc
const safariFix = `!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()},!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();`

class ModernModePlugin {
  constructor (targetDir, isModern) {
    this.targetDir = targetDir
    this.isModern = isModern
  }

  apply (compiler) {
    if (!this.isModern) {
      this.applyLegacy(compiler)
    } else {
      this.applyModern(compiler)
    }
  }

  applyLegacy (compiler) {
    const ID = `vue-cli-legacy-bundle`
    compiler.hooks.compilation.tap(ID, compilation => {
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(ID, async (data, cb) => {
        // get stats, write to disk
        await fs.ensureDir(this.targetDir)
        const htmlName = path.basename(data.plugin.options.filename)
        // Watch out for output files in sub directories
        const htmlPath = path.dirname(data.plugin.options.filename)
        const tempFilename = path.join(this.targetDir, htmlPath, `legacy-assets-${htmlName}.json`)
        await fs.mkdirp(path.dirname(tempFilename))
        await fs.writeFile(tempFilename, JSON.stringify(data.body))
        cb()
      })
    })
  }

  applyModern (compiler) {
    const ID = `vue-cli-modern-bundle`
    compiler.hooks.compilation.tap(ID, compilation => {
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(ID, async (data, cb) => {
        // use <script type="module"> for modern assets
        const modernAssets = data.body.filter(a => a.tagName === 'script' && a.attributes)
        modernAssets.forEach(a => {
          a.attributes.type = 'module'
          a.attributes.crossorigin = 'use-credentials'
        })

        // inject Safari 10 nomodule fix
        data.body.push({
          tagName: 'script',
          closeTag: true,
          innerHTML: safariFix
        })

        // inject links for legacy assets as <script nomodule>
        const htmlName = path.basename(data.plugin.options.filename)
        // Watch out for output files in sub directories
        const htmlPath = path.dirname(data.plugin.options.filename)
        const tempFilename = path.join(this.targetDir, htmlPath, `legacy-assets-${htmlName}.json`)
        const legacyAssets = JSON.parse(await fs.readFile(tempFilename, 'utf-8'))
          .filter(a => a.tagName === 'script' && a.attributes)
        legacyAssets.forEach(a => { a.attributes.nomodule = '' })
        data.body.push(...legacyAssets)
        await fs.remove(tempFilename)
        cb()
      })

      compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tap(ID, data => {
        data.html = data.html
          // use <link rel="modulepreload"> instead of <link rel="preload">
          // for modern assets
          .replace(/(<link as=script .*?)rel=preload>/g, '$1rel=modulepreload crossorigin=use-credentials>')
          .replace(/\snomodule="">/g, ' nomodule>')
      })
    })
  }
}

ModernModePlugin.safariFix = safariFix
module.exports = ModernModePlugin
