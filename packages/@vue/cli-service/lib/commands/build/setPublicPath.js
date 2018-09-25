// This file is imported into lib/wc client bundles.

if (typeof window !== 'undefined') {
  var i
  if ((i = window.document.currentScript) && (i = i.src.match(/(.+\/)[^/]+\.js$/))) {
    __webpack_public_path__ = i[1] // eslint-disable-line
  }
}

// Indicate to webpack that this file can be concatenated
export default null
