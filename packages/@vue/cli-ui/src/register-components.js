/**
 * We register all the components so future cli-ui plugins
 * could use them directly
 */

import Vue from 'vue'

// https://webpack.js.org/guides/dependency-management/#require-context
const requireComponent = require.context('./components', true, /[a-z0-9]+\.(jsx?|vue)$/i)

// For each matching file name...
requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName)
  const componentName = fileName
    .substr(fileName.lastIndexOf('/') + 1)
    // Remove the file extension from the end
    .replace(/\.\w+$/, '')
  // Globally register the component
  Vue.component(componentName, componentConfig.default || componentConfig)
})
