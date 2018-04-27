const fs = require('fs')
const path = require('path')

const camelizeRE = /-(\w)/g
const camelize = str => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
}

const hyphenateRE = /\B([A-Z])/g
const hyphenate = str => {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
}

/**
 * Creates the script to add the component to the custom elements
 * @param {string} prefix The prefix for the component library
 * @param {string} component The component name for single entry builds, component file for multi-entry builds
 * @param {string} file The file for the component
 * @param {boolean} async Whether to load component async or not
 */
const createElement = (prefix, component, file, async) => {
  const { camelName, kebabName } = exports.fileToComponentName(prefix, component)

  return async
    ? `window.customElements.define('${kebabName}', wrap(Vue, () => import('~root/${file}')))\n`
    : `import ${camelName} from '~root/${file}'\n` +
        `window.customElements.define('${kebabName}', wrap(Vue, ${camelName}))\n`
}

exports.fileToComponentName = (prefix, file) => {
  const basename = path.basename(file).replace(/\.(jsx?|vue)$/, '')
  const camelName = camelize(basename)
  const kebabName = `${prefix ? `${prefix}-` : ``}${hyphenate(basename)}`
  return {
    basename,
    camelName,
    kebabName
  }
}

exports.resolveEntry = (prefix, libName, files, async) => {
  const filePath = path.resolve(__dirname, 'entry-wc.js')
  const elements =
    prefix === ''
      ? [createElement('', libName, files[0])]
      : files.map(file => createElement(prefix, file, file, async)).join('\n')

  const content = `
import Vue from 'vue'
import wrap from '@vue/web-component-wrapper'

// runtime shared by every component chunk
import 'css-loader/lib/css-base'
import 'vue-style-loader/lib/addStylesShadow'
import 'vue-loader/lib/runtime/component-normalizer'

;(() => {
  let i
  if ((i = document.currentScript) && (i = i.src.match(/(.+\\/)[^/]+\\.js$/))) {
    __webpack_public_path__ = i[1]
  }
})()

${elements}`.trim()
  fs.writeFileSync(filePath, content)
  return filePath
}
