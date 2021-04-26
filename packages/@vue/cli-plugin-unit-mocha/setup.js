require('jsdom-global')(undefined, { pretendToBeVisual: true, url: 'http://localhost' })

// https://github.com/vuejs/vue-test-utils/issues/936
window.Date = Date
// https://github.com/vuejs/vue-next/pull/2943
global.ShadowRoot = window.ShadowRoot

// https://github.com/vuejs/vue-next/issues/3590
global.SVGElement = window.SVGElement

// https://github.com/vuejs/vue-cli/issues/6427
// https://github.com/mbullington/node_preamble.dart/issues/26
process.versions.electron = ''
