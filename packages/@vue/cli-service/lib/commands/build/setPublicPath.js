// This file is imported into lib/wc client bundles.

if (typeof window !== 'undefined') {
  var currentScript = window.document.currentScript
  if (process.env.NEED_CURRENTSCRIPT_POLYFILL) {
    currentScript = currentScript || require('./getCurrentScript')()
  }

  var src = currentScript && currentScript.src.match(/(.+\/)[^/]+\.js(\?.*)?$/)
  if (src) {
    __webpack_public_path__ = i[1] // eslint-disable-line
  }
}

// Indicate to webpack that this file can be concatenated
export default null
