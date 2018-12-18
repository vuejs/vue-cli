// This file is imported into lib/wc client bundles.

if (typeof window !== 'undefined') {
  var currentScript = window.document.currentScript;
  if(!currentScript) {
    // IE compat
    try {
      throw new Error();
    } catch(err) {
      var scripts = document.getElementsByTagName('script'),
          res     = ((/.*at [^(]*\((.*):.+:.+\)$/ig).exec(err.stack) || [false])[1];
      for(i in scripts) {
        if(scripts[i].src === res || scripts[i].readyState === 'interactive') {
          currentScript = scripts[i]; // eslint-disable-line
          break;
        }
      }
    }
  }
  var i
  if (i = currentScript.src.match(/(.+\/)[^/]+\.js(\?.*)?$/)) {
    __webpack_require__.p = i[1] // eslint-disable-line
  }
}

// Indicate to webpack that this file can be concatenated
export default null
