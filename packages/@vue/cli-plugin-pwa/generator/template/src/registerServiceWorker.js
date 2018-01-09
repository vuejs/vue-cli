/* eslint-disable no-console */

import { register } from '@vue/cli-plugin-pwa/registerServiceWorker'

const serviceWorkerEventBus = register()

serviceWorkerEventBus.$on('new-content', () => {
  console.log('New content is available; please refresh.')
})

serviceWorkerEventBus.$on('content-cached', () => {
  console.log('Content is cached for offline use.')
})

serviceWorkerEventBus.$on('offline', () => {
  console.log('No internet connection found. App is running in offline mode.')
})

serviceWorkerEventBus.$on('error', error => {
  console.error('Error during service worker registration:', error)
})

export default serviceWorkerEventBus
