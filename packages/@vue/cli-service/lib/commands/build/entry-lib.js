;(function () {
  if (typeof window !== 'undefined') {
    let i
    if ((i = window.document.currentScript) && (i = i.src.match(/(.+\/)[^/]+\.js$/))) {
      __webpack_public_path__ = i[1] // eslint-disable-line
    }
  } else {
    __webpack_public_path__ = '/' // eslint-disable-line
  }
})()

import mod from '~entry'
export default mod
export * from '~entry'
