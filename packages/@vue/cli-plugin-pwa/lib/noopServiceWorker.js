/* global self */

// This service worker file is effectively a 'no-op' that will reset any
// previous service worker registered for the same host:port combination.

// It is read and returned by a dev server middleware that is only loaded
// during development.

// In the production build, this file is replaced with an actual service worker
// file that will precache your site's local assets.

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', () => {
  self.clients.matchAll({ type: 'window' }).then(windowClients => {
    for (const windowClient of windowClients) {
      // Force open pages to refresh, so that they have a chance to load the
      // fresh navigation response from the local dev server.
      windowClient.navigate(windowClient.url)
    }
  })
})
