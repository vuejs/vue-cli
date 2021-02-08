const fs = require('fs-extra')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// https://gist.github.com/samthor/64b114e4a4f539915a95b91ffd340acc
const safariFix = `!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()},!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();`

class ModernModePlugin {
  constructor ({ targetDir, isModernBuild, unsafeInline, jsDirectory }) {
    this.targetDir = targetDir
    this.isModernBuild = isModernBuild
    this.unsafeInline = unsafeInline
    this.jsDirectory = jsDirectory
  }

  apply (compiler) {
    if (!this.isModernBuild) {
      this.applyLegacy(compiler)
    } else {
      this.applyModern(compiler)
    }
  }

  applyLegacy (compiler) {
    const ID = `vue-cli-legacy-bundle`
    compiler.hooks.compilation.tap(ID, compilation => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(ID, async (data, cb) => {
        // get stats, write to disk
        await fs.ensureDir(this.targetDir)
        const htmlName = path.basename(data.plugin.options.filename)
        // Watch out for output files in sub directories
        const htmlPath = path.dirname(data.plugin.options.filename)
        const tempFilename = path.join(this.targetDir, htmlPath, `legacy-assets-${htmlName}.json`)
        await fs.mkdirp(path.dirname(tempFilename))

        let tags = data.bodyTags
        if (data.plugin.options.scriptLoading === 'defer') {
          tags = data.headTags
        }
        await fs.writeFile(tempFilename, JSON.stringify(tags))
        cb()
      })
    })
  }

  applyModern (compiler) {
    const ID = `vue-cli-modern-bundle`
    compiler.hooks.compilation.tap(ID, compilation => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(ID, async (data, cb) => {
        let tags = data.bodyTags
        if (data.plugin.options.scriptLoading === 'defer') {
          tags = data.headTags
        }
        // use <script type="module"> for modern assets
        tags.forEach(tag => {
          if (tag.tagName === 'script' && tag.attributes) {
            tag.attributes.type = 'module'
          }
        })

        // use <link rel="modulepreload"> instead of <link rel="preload">
        // for modern assets
        data.headTags.forEach(tag => {
          if (tag.tagName === 'link' &&
              tag.attributes.rel === 'preload' &&
              tag.attributes.as === 'script') {
            tag.attributes.rel = 'modulepreload'
          }
        })

        // inject links for legacy assets as <script nomodule>
        const htmlName = path.basename(data.plugin.options.filename)
        // Watch out for output files in sub directories
        const htmlPath = path.dirname(data.plugin.options.filename)
        const tempFilename = path.join(this.targetDir, htmlPath, `legacy-assets-${htmlName}.json`)
        const legacyAssets = JSON.parse(await fs.readFile(tempFilename, 'utf-8'))
          .filter(a => a.tagName === 'script' && a.attributes)
        legacyAssets.forEach(a => { a.attributes.nomodule = '' })

        if (this.unsafeInline) {
          // inject inline Safari 10 nomodule fix
          tags.push({
            tagName: 'script',
            closeTag: true,
            innerHTML: safariFix
          })
        } else {
          // inject the fix as an external script
          const safariFixPath = path.join(this.jsDirectory, 'safari-nomodule-fix.js')
          const fullSafariFixPath = path.join(compilation.options.output.publicPath, safariFixPath)
          compilation.assets[safariFixPath] = {
            source: function () {
              return Buffer.from(safariFix)
            },
            size: function () {
              return Buffer.byteLength(safariFix)
            }
          }
          tags.push({
            tagName: 'script',
            closeTag: true,
            attributes: {
              src: fullSafariFixPath
            }
          })
        }

        tags.push(...legacyAssets)
        await fs.remove(tempFilename)
        cb()
      })

      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tap(ID, data => {
        data.html = data.html.replace(/\snomodule="">/g, ' nomodule>')
      })
    })
  }
}

ModernModePlugin.safariFix = safariFix
module.exports = ModernModePlugin
