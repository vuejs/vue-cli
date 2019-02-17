require('jsdom-global')(undefined, { pretendToBeVisual: true, url: 'http://localhost' })

// https://github.com/vuejs/vue-test-utils/issues/936
window.Date = Date
